import { getDaysSinceGenesis } from './dateUtils';

/**
 * log10 を計算する（0以下の値も扱える）
 * @param {number} value - 対数を計算する値
 * @returns {number} log10(value)
 */
export const log10 = (value) => Math.log10(Math.max(0.0000001, value));

/**
 * 10の冪乗を計算する（fromLog10(log10(x)) = x）
 * @param {number} logValue - 対数値
 * @returns {number} 10^logValue
 */
export const fromLog10 = (logValue) => Math.pow(10, logValue);

/**
 * ビットコインのパワーロー決定係数を計算する
 * @param {Array} data - 価格データ配列 [[timestamp, price], ...]
 * @returns {number} R^2値
 */
export const calculateRSquared = (data) => {
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
 * @param {number} price - 現在価格
 * @param {number} medianPrice - 中央価格
 * @param {number} supportPrice - 下限価格
 * @returns {number} 相対位置（0=下限、100=中央）
 */
export const calculatePowerLawPosition = (price, medianPrice, supportPrice) => {
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
 * @param {number} position - 相対位置（0-100+）
 * @returns {string} 位置の説明
 */
export const getPowerLawPositionLabel = (position) => {
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
 * @param {number} position - 相対位置（0-100+）
 * @returns {string} 色名
 */
export const getPowerLawPositionColor = (position) => {
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
 * パーセント形式フォーマット
 * @param {number} value - フォーマットする値
 * @param {number} decimals - 小数点以下の桁数
 * @returns {string} フォーマットされた文字列
 */
export const formatPercentage = (value, decimals = 1) => {
    if (value === null || isNaN(value)) return '-';
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};