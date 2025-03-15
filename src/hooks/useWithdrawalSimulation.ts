import { calculateDays } from '../utils/dateUtils'; import { useState } from 'react';
import { btcPriceMedian } from '../utils/models';
import { DEFAULTS, CURRENT_YEAR, TRANSITION_START_YEAR, TARGET_YEAR, PriceModel } from '../utils/constants';

export interface WithdrawalInputs {
    initialBTC: string;
    startYear: string;
    priceModel: PriceModel;
    withdrawalType: 'fixed' | 'percentage';
    withdrawalAmount: string;
    withdrawalRate: string;
    showSecondPhase: boolean;
    secondPhaseYear: string;
    secondPhaseType: 'fixed' | 'percentage';
    secondPhaseAmount: string;
    secondPhaseRate: string;
    taxRate: string;
    exchangeRate: string;
    inflationRate: string;
}

export interface WithdrawalSimulationResult {
    year: number;
    btcPrice: number;
    withdrawalRate: number | string;
    withdrawalAmount: number | string;
    withdrawalBTC: number | string;
    remainingBTC: number;
    totalValue: number;
    phase: string;
}

interface SimulationErrors {
    initialBTC?: string;
    startYear?: string;
    withdrawalAmount?: string;
    withdrawalRate?: string;
    secondPhaseYear?: string;
    secondPhaseAmount?: string;
    secondPhaseRate?: string;
    taxRate?: string;
    exchangeRate?: string;
    inflationRate?: string;
    simulation?: string;
}

export const useWithdrawalSimulation = () => {
    const [results, setResults] = useState<WithdrawalSimulationResult[]>([]);
    const [errors, setErrors] = useState<SimulationErrors>({});

    // 入力値検証
    const validateInputs = (inputs: WithdrawalInputs): boolean => {
        const newErrors: SimulationErrors = {};

        if (!inputs.initialBTC || isNaN(parseFloat(inputs.initialBTC)) || parseFloat(inputs.initialBTC) < 0) {
            newErrors.initialBTC = '有効な値を入力してください';
        }

        if (inputs.withdrawalType === 'fixed') {
            if (!inputs.withdrawalAmount || isNaN(parseFloat(inputs.withdrawalAmount)) || parseFloat(inputs.withdrawalAmount) <= 0) {
                newErrors.withdrawalAmount = '有効な値を入力してください';
            }
        } else {
            if (!inputs.withdrawalRate || isNaN(parseFloat(inputs.withdrawalRate)) || parseFloat(inputs.withdrawalRate) <= 0 || parseFloat(inputs.withdrawalRate) > 100) {
                newErrors.withdrawalRate = '0～100%で入力してください';
            }
        }

        if (inputs.showSecondPhase) {
            if (inputs.secondPhaseType === 'fixed' && (!inputs.secondPhaseAmount || isNaN(parseFloat(inputs.secondPhaseAmount)) || parseFloat(inputs.secondPhaseAmount) <= 0)) {
                newErrors.secondPhaseAmount = '有効な値を入力してください';
            }
            if (inputs.secondPhaseType === 'percentage' && (!inputs.secondPhaseRate || isNaN(parseFloat(inputs.secondPhaseRate)) || parseFloat(inputs.secondPhaseRate) <= 0 || parseFloat(inputs.secondPhaseRate) > 100)) {
                newErrors.secondPhaseRate = '0～100%で入力してください';
            }
            if (parseInt(inputs.secondPhaseYear) <= parseInt(inputs.startYear)) {
                newErrors.secondPhaseYear = '開始年より後にしてください';
            }
        }

        if (parseFloat(inputs.taxRate) < 0 || parseFloat(inputs.taxRate) > 100) {
            newErrors.taxRate = '0～100%で入力してください';
        }
        if (parseFloat(inputs.exchangeRate) <= 0) {
            newErrors.exchangeRate = '0より大きくしてください';
        }
        if (parseFloat(inputs.inflationRate) < 0) {
            newErrors.inflationRate = '0%以上で入力してください';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // シミュレーション実行
    const simulate = (inputs: WithdrawalInputs): void => {
        if (!validateInputs(inputs)) return;

        try {
            let currentBTC = parseFloat(inputs.initialBTC);
            const simulationResults: WithdrawalSimulationResult[] = [];
            const exchangeRateNum = parseFloat(inputs.exchangeRate);
            const taxRateNum = parseFloat(inputs.taxRate) / 100;
            const inflationRateNum = parseFloat(inputs.inflationRate) / 100;
            const startYearNum = parseInt(inputs.startYear);
            let basePriceUSD: number | null = null;
            let baseDays: number | null = null;

            for (let year = CURRENT_YEAR; year <= TARGET_YEAR; year++) {
                const isBeforeStart = year < startYearNum; // 取り崩し開始前かどうか
                const days = calculateDays(year);

                // BTC価格計算 (パワーローモデル)
                let btcPriceUSD = btcPriceMedian(days, inputs.priceModel);
                if (year >= TRANSITION_START_YEAR) {
                    // 2039年以降は減衰
                    if (!basePriceUSD) {
                        basePriceUSD = btcPriceMedian(calculateDays(TRANSITION_START_YEAR - 1), inputs.priceModel); // 2038年末時点の価格
                        baseDays = calculateDays(TRANSITION_START_YEAR - 1);
                    }
                    // 減衰率 (standard: 0.2, conservative: 0.25)
                    const decayRate = inputs.priceModel === 'standard' ? 0.2 : 0.25;
                    // 2050年時点のスケール (standard: 0.41, conservative: 0.5)
                    const targetScale = inputs.priceModel === 'standard' ? 0.41 : 0.5;
                    const scale = targetScale + (1.0 - targetScale) * Math.exp(-decayRate * (year - (TRANSITION_START_YEAR - 1)));
                    btcPriceUSD = basePriceUSD * Math.pow(btcPriceMedian(days, inputs.priceModel) / btcPriceMedian(baseDays, inputs.priceModel), scale);
                }

                // 価格が異常値の場合はエラー
                if (!btcPriceUSD || btcPriceUSD <= 0) {
                    throw new Error(`Invalid BTC price calculated for year ${year}: ${btcPriceUSD}`);
                }

                // 実効為替レート
                const effectiveExchangeRate = exchangeRateNum * Math.pow(1 + inflationRateNum, year - startYearNum);
                const btcPriceJPY = btcPriceUSD * effectiveExchangeRate;

                let withdrawalBTC = 0; // 年間のBTC取り崩し量
                let withdrawalValue = 0; // 年間の取り崩し額 (日本円)
                let effectiveWithdrawalRate = 0; // 実効取り崩し率

                if (!isBeforeStart) {
                    // 取り崩し計算
                    let currentWithdrawalType = inputs.withdrawalType;
                    let currentWithdrawalAmount = inputs.withdrawalAmount;
                    let currentWithdrawalRate = inputs.withdrawalRate;

                    // 2段階目が有効な場合
                    if (inputs.showSecondPhase && year >= parseInt(inputs.secondPhaseYear)) {
                        currentWithdrawalType = inputs.secondPhaseType;
                        currentWithdrawalAmount = inputs.secondPhaseAmount;
                        currentWithdrawalRate = inputs.secondPhaseRate;
                    }

                    if (currentWithdrawalType === 'fixed') {
                        // 定額取り崩し
                        const annualWithdrawalAmount = parseFloat(currentWithdrawalAmount) * 12; // 月額を年額に
                        withdrawalBTC = annualWithdrawalAmount / btcPriceJPY; // BTC換算
                        withdrawalValue = annualWithdrawalAmount;
                        // 取り崩し額が保有量を超える場合はエラー
                        if (withdrawalBTC > currentBTC) {
                            throw new Error(`Withdrawal amount exceeds available BTC in year ${year}.`);
                        }
                        effectiveWithdrawalRate = (withdrawalBTC / currentBTC) * 100;
                    } else { // 定率
                        effectiveWithdrawalRate = parseFloat(currentWithdrawalRate);
                        withdrawalBTC = currentBTC * (effectiveWithdrawalRate / 100);
                        withdrawalValue = withdrawalBTC * btcPriceJPY; // JPY換算
                        if (withdrawalBTC > currentBTC) {
                            withdrawalBTC = currentBTC;
                            withdrawalValue = withdrawalBTC * btcPriceJPY;
                        }
                    }
                }

                const yearEndBTC = currentBTC - withdrawalBTC; // 年末時点のBTC
                const totalValue = currentBTC * btcPriceJPY;   // 年末時点の評価額

                simulationResults.push({
                    year,
                    btcPrice: btcPriceJPY,
                    withdrawalRate: isBeforeStart ? '-' : effectiveWithdrawalRate,
                    withdrawalAmount: isBeforeStart ? '-' : withdrawalValue,
                    withdrawalBTC: isBeforeStart ? '-' : withdrawalBTC,
                    remainingBTC: yearEndBTC,
                    totalValue,
                    phase: isBeforeStart ? '-' : (inputs.showSecondPhase && year >= parseInt(inputs.secondPhaseYear)) ? '2段階目' : (inputs.showSecondPhase ? '1段階目' : '-'),
                });

                currentBTC = yearEndBTC; // 現在のBTC保有量を更新
                if (currentBTC < 0 || year >= TARGET_YEAR) break;
            }

            setResults(simulationResults);
            setErrors({});
        } catch (err: any) {
            setErrors({ simulation: 'シミュレーション中にエラーが発生しました: ' + err.message });
        }
    };

    return {
        results,
        errors,
        simulate,
        validateInputs
    };
};