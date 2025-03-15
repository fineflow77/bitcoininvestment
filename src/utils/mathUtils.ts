import { getDaysSinceGenesis } from './dateUtils';

/**
 * log10 を計算する（0以下の値も扱える）
 * @param value - 対数を計算する値（0以下の場合最小値 0.0000001 を使用）
 * @returns 計算された log10 値
 */
export const log10 = (value: number): number => Math.log10(Math.max(0.0000001, value));

/**
 * 10の冪乗を計算する（fromLog10(log10(x)) = x）
 * @param logValue - 対数値
 * @returns 10^logValue の結果
 */
export const fromLog10 = (logValue: number): number => Math.pow(10, logValue);

/**
 * ビットコインのパワーロー決定係数を計算する
 * @param data - 価格データ配列 [[timestamp, price], ...]（timestamp: number, price: number のタプル）
 * @returns R^2値（計算不能の場合は null）
 */
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
        const x = Math.log10(Math.max(1, days)); // 0以下の場合を考慮
        const y = Math.log10(Math.max(0.0000001, price)); // 0以下の場合を考慮

        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
        sumY2 += y * y;
    }

    // 相関係数の二乗
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return 0; // 0除算を防止

    return Math.pow(numerator / denominator, 2);
};

/**
 * パワーロー内位置（分位）を計算
 * @param price - 現在価格
 * @param medianPrice - 中央価格
 * @param supportPrice - 下限価格
 * @returns 相対位置（0=下限、100=中央、100以上=中央超え）または null（入力が不正な場合）
 */
export const calculatePowerLawPosition = (price: number, medianPrice: number, supportPrice: number): number | null => {
    if (!price || !medianPrice || !supportPrice) return null;

    // 対数スケールでの計算（より正確）
    const logPrice = Math.log10(price);
    const logMedian = Math.log10(medianPrice);
    const logSupport = Math.log10(supportPrice);

    // 中央値と下限の間での位置（0〜100）
    if (logPrice <= logMedian) {
        return ((logPrice - logSupport) / (logMedian - logSupport)) * 100;
    }
    // 中央値以上を100以上の値で表現
    else {
        return 100 + ((logPrice - logMedian) / logMedian) * 100;
    }
};

/**
 * パワーロー位置に基づくラベルを返す
 * @param position - 相対位置（0-100+）または null/undefined
 * @returns 位置の説明
 */
export const getPowerLawPositionLabel = (position: number | null | undefined): string => {
    if (position === null || position === undefined) return '計算不可';

    if (position < 0) return '非常に割安';
    if (position < 40) return '割安';
    if (position < 80) return 'やや割安';
    if (position < 120) return '適正範囲';
    if (position < 160) return 'やや割高';
    if (position < 200) return '割高';
    return '非常に割高';
};

/**
 * パワーロー位置に基づく色を返す
 * @param position - 相対位置（0-100+）または null/undefined
 * @returns 色名（CSS 形式）
 */
export const getPowerLawPositionColor = (position: number | null | undefined): string => {
    if (position === null || position === undefined) return '#888888';

    if (position < 0) return '#1565C0'; // 濃い青
    if (position < 40) return '#2196F3'; // 青
    if (position < 80) return '#4CAF50'; // 緑
    if (position < 120) return '#8BC34A'; // 黄緑
    if (position < 160) return '#FFC107'; // 黄色
    if (position < 200) return '#FF9800'; // オレンジ
    return '#F44336'; // 赤
};

/**
 * パーセント形式でフォーマット
 * @param value - フォーマットする値
 * @param decimals - 小数点以下の桁数（デフォルト: 1）
 * @returns フォーマットされた文字列（例: '+12.3%'）
 */
export const formatPercentage = (value: number | null, decimals: number = 1): string => {
    if (value === null || isNaN(value)) return '-';
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};