import { PriceModelType } from '../types';
import { getDaysSinceGenesis } from './dateUtils';

export const btcPriceMedian = (days: number, model: PriceModelType = 'standard'): number => {
    let medianModelLog: number;
    if (model === 'standard') {
        medianModelLog = -17.01593313 + 5.84509376 * Math.log10(days);
    } else {
        medianModelLog = -17.5 + 5.5 * Math.log10(days);
    }
    return Math.pow(10, medianModelLog);
};

export const calculateRSquared = (data: [number, number][]): number | null => {
    if (!data || data.length === 0) return null;

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;
    const n = data.length;

    for (let i = 0; i < n; i++) {
        const [timestamp, price] = data[i];
        const days = getDaysSinceGenesis(new Date(timestamp));
        const x = Math.log10(Math.max(1, days));
        const y = Math.log10(Math.max(0.0000001, price));

        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
        sumY2 += y * y;
    }

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    return denominator === 0 ? 0 : Math.pow(numerator / denominator, 2);
};

export const calculatePowerLawPosition = (price: number, medianPrice: number): number | null => {
    if (!price || !medianPrice) return null;
    return ((price - medianPrice) / medianPrice) * 100;
};

export const calculateSupportDeviation = (price: number, supportPrice: number): number | null => {
    if (!price || !supportPrice) return null;
    return ((price - supportPrice) / supportPrice) * 100;
};

export const getPowerLawPositionLabel = (position: number | null | undefined, supportDeviation: number | null = null): string => {
    if (position === null || position === undefined) return '計算不可';

    let baseLabel = '';
    if (position < -50) baseLabel = '買い増しチャンス';
    else if (position < -30) baseLabel = '割安';
    else if (position < -10) baseLabel = 'やや割安';
    else if (position <= 10) baseLabel = '適正範囲';
    else if (position <= 30) baseLabel = '上昇（注意）';
    else if (position <= 70) baseLabel = '高値警戒';
    else baseLabel = 'ピーク警戒（売却検討）';

    if (supportDeviation !== null && supportDeviation < 10) {
        return `${baseLabel} - 下限に接近`;
    }
    return baseLabel;
};

export const getPowerLawPositionColor = (position: number | null | undefined, supportDeviation: number | null = null): string => {
    if (position === null || position === undefined) return '#888888';

    if (supportDeviation !== null && supportDeviation < 10) return '#D81B60';

    if (position < -50) return '#1565C0';
    if (position < -30) return '#2196F3';
    if (position < -10) return '#4CAF50';
    if (position <= 10) return '#8BC34A';
    if (position <= 30) return '#FF9800';
    if (position <= 70) return '#F44336';
    return '#B71C1C';
};

export const formatPercentage = (value: number | null, decimals: number = 1): string => {
    if (value === null || isNaN(value)) return '-';
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};