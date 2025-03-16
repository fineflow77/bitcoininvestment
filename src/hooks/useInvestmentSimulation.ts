import { useState } from 'react';
import { getDaysSinceGenesis } from '../utils/dateUtils';
import { CURRENT_YEAR, TRANSITION_START_YEAR, TARGET_YEAR, PriceModel } from '../utils/constants';

// パワーロー価格計算関数をローカルで定義
const btcPriceMedian = (daysSinceGenesis: number, priceModel: PriceModel): number => {
    // パワーロー方程式: price = a * days^b
    // 係数 a と指数 b はモデルに基づいて調整
    const coefficients = {
        [PriceModel.STANDARD]: { a: 0.000015, b: 3.5 },    // 標準モデル（例）
        [PriceModel.CONSERVATIVE]: { a: 0.00001, b: 3.2 }, // 保守的モデル（例）
    };
    const { a, b } = coefficients[priceModel];
    return a * Math.pow(daysSinceGenesis, b); // USDでの価格を返す
};

export interface SimulationInputs {
    initialInvestmentType: 'btc' | 'jpy';
    initialInvestment: number;
    initialBtcHolding: number;
    monthlyInvestment: number;
    years: number;
    priceModel: PriceModel;
    exchangeRate: number;
    inflationRate: number;
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

export interface SimulationErrors {
    initialInvestment?: string;
    initialBtcHolding?: string;
    monthlyInvestment?: string;
    years?: string;
    exchangeRate?: string;
    inflationRate?: string;
    simulation?: string;
}

const TRANSITION_CONFIG = {
    [PriceModel.STANDARD]: { targetScale: 0.41, decayRate: 0.2 },
    [PriceModel.CONSERVATIVE]: { targetScale: 0.5, decayRate: 0.25 },
};

export const useInvestmentSimulation = () => {
    const [results, setResults] = useState<InvestmentSimulationResult[]>([]);
    const [errors, setErrors] = useState<SimulationErrors>({});

    const validateInputs = (inputs: SimulationInputs): boolean => {
        const newErrors: SimulationErrors = {};

        if (inputs.initialInvestmentType === 'jpy') {
            if (inputs.initialInvestment < 0 || isNaN(inputs.initialInvestment)) {
                newErrors.initialInvestment = '0以上の値を入力してください';
            }
        } else {
            if (inputs.initialBtcHolding < 0 || isNaN(inputs.initialBtcHolding)) {
                newErrors.initialBtcHolding = '0以上の値を入力してください';
            }
        }

        if (inputs.monthlyInvestment <= 0 || isNaN(inputs.monthlyInvestment)) {
            newErrors.monthlyInvestment = '有効な値を入力してください';
        }

        if (inputs.years <= 0 || inputs.years > 50 || isNaN(inputs.years)) {
            newErrors.years = '1～50年で入力してください';
        }

        if (inputs.exchangeRate <= 0 || isNaN(inputs.exchangeRate)) {
            newErrors.exchangeRate = '0より大きい値を入力してください';
        }

        if (inputs.inflationRate < 0 || isNaN(inputs.inflationRate)) {
            newErrors.inflationRate = '0以上の値を入力してください';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const simulate = (inputs: SimulationInputs): void => {
        if (!validateInputs(inputs)) return;

        try {
            const simulationResults: InvestmentSimulationResult[] = [];
            const config = TRANSITION_CONFIG[inputs.priceModel];
            const startYear = CURRENT_YEAR;
            const endYear = Math.max(TARGET_YEAR, startYear + inputs.years);
            let btcHeld = inputs.initialInvestmentType === 'jpy' ? 0 : inputs.initialBtcHolding;
            let initialInvestmentValue = inputs.initialInvestmentType === 'jpy' ? inputs.initialInvestment : 0;

            const initialDays = getDaysSinceGenesis(new Date(startYear, 0, 1));
            const initialBtcPriceUSD = btcPriceMedian(initialDays, inputs.priceModel);
            const initialBtcPriceJPY = initialBtcPriceUSD * inputs.exchangeRate;

            if (inputs.initialInvestmentType === 'jpy') {
                btcHeld = initialInvestmentValue / initialBtcPriceJPY;
            }

            let currentValueJPY = btcHeld * initialBtcPriceJPY;

            const baseDays = getDaysSinceGenesis(new Date(TRANSITION_START_YEAR - 1, 0, 1));
            const basePriceUSD = btcPriceMedian(baseDays, inputs.priceModel);

            for (let year = startYear; year <= endYear; year++) {
                const isInvestmentPeriod = year < startYear + inputs.years;
                const days = getDaysSinceGenesis(new Date(year, 0, 1));

                let btcPriceUSD = btcPriceMedian(days, inputs.priceModel);
                if (year >= TRANSITION_START_YEAR) {
                    const scale = config.targetScale + (1.0 - config.targetScale) * Math.exp(-config.decayRate * (year - (TRANSITION_START_YEAR - 1)));
                    btcPriceUSD = basePriceUSD * Math.pow(btcPriceMedian(days, inputs.priceModel) / btcPriceMedian(baseDays, inputs.priceModel), scale);
                }

                const inflationAdjustedExchangeRate = inputs.exchangeRate * Math.pow(1 + inputs.inflationRate / 100, year - startYear);
                const btcPriceJPY = btcPriceUSD * inflationAdjustedExchangeRate;

                const annualInvestment = isInvestmentPeriod ? inputs.monthlyInvestment * 12 : 0;
                const btcPurchased = annualInvestment / btcPriceJPY;

                btcHeld += btcPurchased;
                currentValueJPY = btcHeld * btcPriceJPY;

                simulationResults.push({
                    year,
                    btcPrice: btcPriceJPY,
                    annualInvestment,
                    btcPurchased,
                    btcHeld,
                    totalValue: currentValueJPY,
                    isInvestmentPeriod,
                });
            }

            setResults(simulationResults);
            setErrors({});
        } catch (err) {
            setErrors({ simulation: `シミュレーションエラー: ${err instanceof Error ? err.message : '不明なエラー'}` });
        }
    };

    return {
        results,
        errors,
        simulate,
        validateInputs,
    };
};