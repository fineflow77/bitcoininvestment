// src/utils/powerLawUtils.js

const GENESIS_DATE = new Date('2009-01-03');

export const calculateDaysSinceGenesis = (dateStr) => {
    const date = new Date(dateStr);
    return Math.max(1, Math.floor((date - GENESIS_DATE) / (1000 * 60 * 60 * 24)));
};

export const calculateMedianPrice = (days) => {
    return Math.pow(10, -17.01593313 + 5.84509376 * Math.log10(days));
};

export const calculateSupportPrice = (days) => {
    return Math.pow(10, -17.668) * Math.pow(days, 5.926);
};

/**
 * 現在価格のパワーロー範囲内での相対位置を計算
 * @param {number} currentPrice - 現在の価格
 * @param {number} medianPrice - パワーロー中央価格
 * @param {number} supportPrice - パワーロー下限価格
 * @returns {number} 相対位置 (0 = 下限価格, 100 = 中央価格)
 */
export const calculatePowerLawPosition = (currentPrice, medianPrice, supportPrice) => {
    if (!currentPrice || !medianPrice || !supportPrice) return null;

    // 中央価格と下限価格の差
    const range = medianPrice - supportPrice;

    // 差がなければ計算できない
    if (range === 0) return null;

    // 現在価格の下限価格からの距離
    const position = currentPrice - supportPrice;

    // 相対位置をパーセンテージで表現 (0% = 下限価格, 100% = 中央価格)
    const percentage = (position / range) * 100;

    return percentage;
};

/**
 * パワーロー相対位置に基づく評価を取得（7段階評価）
 * @param {number} position - 相対位置 (0-100+)
 * @returns {object} 評価内容
 */
export const getPowerLawPositionEvaluation = (position) => {
    if (position === null || position === undefined) {
        return { text: "評価不能", color: "text-gray-400" };
    }

    // 7段階評価
    if (position <= 0) return { text: "非常に割安", color: "text-green-500" };
    if (position <= 40) return { text: "割安", color: "text-green-400" };
    if (position <= 80) return { text: "やや割安", color: "text-green-300" };
    if (position <= 120) return { text: "適正", color: "text-yellow-400" };
    if (position <= 170) return { text: "やや割高", color: "text-orange-300" };
    if (position <= 240) return { text: "割高", color: "text-red-400" };

    // 240%超は非常に割高
    return { text: "非常に割高", color: "text-red-600" };
};

/**
 * パワーロー相対位置に対応する説明文を取得
 * @param {number} position - 相対位置 (0-100+)
 * @returns {string} 説明文
 */
export const getPowerLawPositionLabel = (position) => {
    if (position === null || position === undefined) return "評価不能";

    if (position < 0) {
        return `下限価格より${Math.abs(position).toFixed(1)}%下`;
    }
    if (position == 0) {
        return `下限価格と同じ`;
    }
    if (position < 100) {
        return `下限と中央の間 (下限から${position.toFixed(1)}%)`;
    }
    if (position == 100) {
        return `中央価格と同じ`;
    }
    // 中央価格を超える場合
    return `中央価格より${(position - 100).toFixed(1)}%上`;
};

/**
 * パワーロー相対位置に対応する色を取得
 * @param {number} position - 相対位置 (0-100+)
 * @returns {string} テールウィンドのカラークラス
 */
export const getPowerLawPositionColor = (position) => {
    if (position === null || position === undefined) return "text-gray-400";

    if (position <= 0) return "text-green-500";
    if (position <= 40) return "text-green-400";
    if (position <= 80) return "text-green-300";
    if (position <= 120) return "text-yellow-400";
    if (position <= 170) return "text-orange-300";
    if (position <= 240) return "text-red-400";
    return "text-red-600";
};