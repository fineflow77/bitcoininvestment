import { useState } from 'react';
import { getDaysSinceGenesis } from '../utils/dateUtils'; // calculateDays を getDaysSinceGenesis に仮定
import { btcPriceMedian } from '../utils/models';
import { DEFAULTS, CURRENT_YEAR, TRANSITION_START_YEAR, TARGET_YEAR, PriceModel } from '../utils/constants';

export interface SimulationInputs {
    initialInvestmentType: 'btc' | 'jpy';
    initialInvestment: string;
    initialBtcHolding: string;
    monthlyInvestment: string;
    years: string;
    priceModel: PriceModel;
    exchangeRate: string;
    inflationRate: string;
}

export interface InvestmentSimulationResult {
    year: number;
    btcPrice: number;
    annualInvestment: number;
    btcPurchased: number;
    btcHeld: number;
    totalValue: number;
    isInvestmentPeriod: boolean;
}

interface SimulationErrors {
    initialInvestment?: string;
    initialBtcHolding?: string;
    monthlyInvestment?: string;
    years?: string;
    exchangeRate?: string;
    inflationRate?: string;
    simulation?: string;
}

export const useInvestmentSimulation = () => {
    const [results, setResults] = useState<InvestmentSimulationResult[]>([]);
    const [errors, setErrors] = useState<SimulationErrors>({});

    // 入力値検証関数
    const validateInputs = (inputs: SimulationInputs): boolean => {
        const newErrors: SimulationErrors = {};

        if (inputs.initialInvestmentType === 'jpy') {
            const initialInvestment = parseFloat(inputs.initialInvestment);
            if (!inputs.initialInvestment || isNaN(initialInvestment) || initialInvestment < 0) {
                newErrors.initialInvestment = '0以上の値を入力してください';
            }
        } else {
            const initialBtcHolding = parseFloat(inputs.initialBtcHolding);
            if (!inputs.initialBtcHolding || isNaN(initialBtcHolding) || initialBtcHolding < 0) {
                newErrors.initialBtcHolding = '0以上の値を入力してください';
            }
        }

        const monthlyInvestment = parseFloat(inputs.monthlyInvestment);
        if (!inputs.monthlyInvestment || isNaN(monthlyInvestment) || monthlyInvestment <= 0) {
            newErrors.monthlyInvestment = '有効な値を入力してください';
        }

        const years = parseInt(inputs.years);
        if (!inputs.years || isNaN(years) || years <= 0 || years > 50) {
            newErrors.years = '1～50年で入力してください';
        }

        const exchangeRate = parseFloat(inputs.exchangeRate);
        if (!inputs.exchangeRate || isNaN(exchangeRate) || exchangeRate <= 0) {
            newErrors.exchangeRate = '0より大きい値を入力してください';
        }

        const inflationRate = parseFloat(inputs.inflationRate);
        if (!inputs.inflationRate || isNaN(inflationRate) || inflationRate < 0) {
            newErrors.inflationRate = '0以上の値を入力してください';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // シミュレーション実行関数
    const simulate = (inputs: SimulationInputs): void => {
        if (!validateInputs(inputs)) return;

        try {
            const simulationResults: InvestmentSimulationResult[] = [];
            const exchangeRateNum = parseFloat(inputs.exchangeRate);
            const inflationRateNum = parseFloat(inputs.inflationRate) / 100;
            const monthlyInvestmentNum = parseFloat(inputs.monthlyInvestment);
            const yearsNum = parseInt(inputs.years);
            const startYear = CURRENT_YEAR;
            const endYear = Math.max(TARGET_YEAR, startYear + yearsNum);
            let basePriceUSD: number | null = null;
            let baseDays: number | null = null;
            let btcHeld = inputs.initialInvestmentType === 'jpy' ? 0 : parseFloat(inputs.initialBtcHolding) || 0;
            let initialInvestmentValue = inputs.initialInvestmentType === 'jpy' ? parseFloat(inputs.initialInvestment) || 0 : 0;

            // 初年度のBTC価格を計算
            const initialDays = getDaysSinceGenesis(new Date(startYear, 0, 1)); // 1月1日基準
            const initialBtcPriceUSD = btcPriceMedian(initialDays, inputs.priceModel);
            const initialExchangeRate = exchangeRateNum;
            const initialBtcPriceJPY = initialBtcPriceUSD * initialExchangeRate;

            if (inputs.initialInvestmentType === 'jpy') {
                btcHeld = initialInvestmentValue / initialBtcPriceJPY;
            }

            let currentValueJPY = btcHeld * initialBtcPriceJPY;

            // 各年のシミュレーション
            for (let year = startYear; year <= endYear; year++) {
                const isInvestmentPeriod = year < startYear + yearsNum;
                const days = getDaysSinceGenesis(new Date(year, 0, 1)); // 年初の日数

                // BTC価格計算（パワーローモデル）
                let btcPriceUSD = btcPriceMedian(days, inputs.priceModel);
                if (year >= TRANSITION_START_YEAR) {
                    if (!basePriceUSD) {
                        basePriceUSD = btcPriceMedian(getDaysSinceGenesis(new Date(TRANSITION_START_YEAR - 1, 0, 1)), inputs.priceModel);
                        baseDays = getDaysSinceGenesis(new Date(TRANSITION_START_YEAR - 1, 0, 1));
                    }
                    const targetScale = inputs.priceModel === PriceModel.STANDARD ? 0.41 : 0.5;
                    const decayRate = inputs.priceModel === PriceModel.STANDARD ? 0.2 : 0.25;
                    const scale = targetScale + (1.0 - targetScale) * Math.exp(-decayRate * (year - (TRANSITION_START_YEAR - 1)));
                    btcPriceUSD = basePriceUSD * Math.pow(btcPriceMedian(days, inputs.priceModel) / btcPriceMedian(baseDays, inputs.priceModel), scale);
                }

                // インフレ調整後の価格
                const inflationAdjustedExchangeRate = exchangeRateNum * Math.pow(1 + inflationRateNum, year - startYear);
                const btcPriceJPY = btcPriceUSD * inflationAdjustedExchangeRate;

                // 年間投資額と購入BTC量
                const annualInvestment = isInvestmentPeriod ? monthlyInvestmentNum * 12 : 0;
                const btcPurchased = annualInvestment / btcPriceJPY;

                // BTC保有量と評価額
                btcHeld += btcPurchased;
                currentValueJPY = btcHeld * btcPriceJPY;

                simulationResults.push({
                    year,
                    btcPrice: btcPriceJPY, // インフレ調整後の円価格
                    annualInvestment,
                    btcPurchased,
                    btcHeld,
                    totalValue: currentValueJPY,
                    isInvestmentPeriod,
                });
            }

            setResults(simulationResults);
            setErrors({});
        } catch (err: any) {
            setErrors({ simulation: `シミュレーションエラー: ${err.message || '不明なエラー'}` });
        }
    };

    return {
        results,
        errors,
        simulate,
        validateInputs,
    };
};

