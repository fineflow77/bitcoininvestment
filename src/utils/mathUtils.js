// src/utils/mathUtils.js

export const log10 = (value) => Math.log10(Math.max(0.0000001, value));
export const fromLog10 = (logValue) => Math.pow(10, logValue);

// パワーロー内位置（分位）を計算
export const calculatePowerLawPosition = (price, medianPrice, supportPrice, resistancePrice = null) => {
    if (!price || !medianPrice || !supportPrice) return null;

    // 対数スケールでの計算（より正確）
    const logPrice = Math.log10(price);
    const logMedian = Math.log10(medianPrice);
    const logSupport = Math.log10(supportPrice);

    // 中央値と下限の間での位置（0〜1）
    if (logPrice <= logMedian) {
        return {
            position: (logPrice - logSupport) / (logMedian - logSupport),
            zone: "lower" // 下限〜中央値ゾーン
        };
    }
    // 上限値がある場合は中央値〜上限値の間も計算
    else if (resistancePrice) {
        const logResistance = Math.log10(resistancePrice);
        return {
            position: 1 + (logPrice - logMedian) / (logResistance - logMedian),
            zone: "upper" // 中央値〜上限ゾーン
        };
    }
    // 上限値がない場合は中央値以上を1以上の値で表現
    else {
        return {
            position: 1 + (logPrice - logMedian) / logMedian,
            zone: "upper" // 中央値以上ゾーン
        };
    }
};

// 分位点に基づく市場状態ラベル
export const getPowerLawPositionLabel = (positionData) => {
    if (!positionData) return '計算不可';

    const { position, zone } = positionData;
    const normalizedPosition = Math.max(0, Math.min(2, position)); // 0〜2の範囲に正規化

    if (zone === "lower") {
        if (position < 0.2) return '非常に割安';
        if (position < 0.4) return '割安';
        if (position < 0.6) return 'やや割安'; // 修正: 0.7 -> 0.6
        if (position < 0.8) return '適正範囲';  // 修正: 0.9 -> 0.8
        return '中央値付近';
    } else { // upper
        if (position < 1.2) return '中央値付近'; // 修正: 1.1 -> 1.2
        if (position < 1.4) return '適正範囲';  // 修正: 1.3 -> 1.4
        if (position < 1.6) return 'やや割高';
        if (position < 1.8) return '割高';
        return '非常に割高';
    }
};

// 分位点に基づく色を返す
export const getPowerLawPositionColor = (positionData) => {
    if (!positionData) return '#888888';

    const { position, zone } = positionData;
    const normalizedPosition = Math.max(0, Math.min(2, position)); // 0〜2の範囲に正規化

    if (zone === "lower") {
        if (position < 0.2) return '#1565C0'; // 濃い青（非常に割安）
        if (position < 0.4) return '#2196F3'; // 青（割安）
        if (position < 0.7) return '#4CAF50'; // 緑（やや割安）
        if (position < 0.9) return '#8BC34A'; // 黄緑（適正範囲）
        return '#CDDC39'; // 黄緑（中央値付近）
    } else { // upper
        if (position < 1.1) return '#CDDC39'; // 黄緑（中央値付近）
        if (position < 1.3) return '#FFC107'; // 黄色（適正範囲）
        if (position < 1.6) return '#FF9800'; // オレンジ（やや割高）
        if (position < 1.8) return '#FF5722'; // 深オレンジ（割高）
        return '#F44336'; // 赤（非常に割高）
    }
};

// パーセントフォーマット
export const formatPercentage = (value, decimals = 1) => {
    if (value === null || isNaN(value)) return '-';
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};