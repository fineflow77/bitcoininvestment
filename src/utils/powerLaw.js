/**
 * パワーロー計算用ユーティリティ
 */

// パワーローの係数（要調整）
const POWER_LAW_COEFFICIENT = 1.467e-6;
const POWER_LAW_EXPONENT = 3.4;
const STD_DEV_FACTOR = 0.45; // 標準偏差係数

/**
 * パワーロー価格を計算
 * @param {number} stockToFlow - Stock to Flow比率
 * @returns {Object} 予測価格とボトム価格
 */
export const calculatePowerLawPrice = (stockToFlow) => {
  const predictedPrice = POWER_LAW_COEFFICIENT * Math.pow(stockToFlow, POWER_LAW_EXPONENT);
  const bottomPrice = predictedPrice * Math.exp(-STD_DEV_FACTOR);
  
  return {
    predicted: predictedPrice,
    bottom: bottomPrice
  };
};

/**
 * 年ごとのStock to Flow比率を計算
 * @param {number} year - 対象年
 * @returns {number} Stock to Flow比率
 */
export const calculateStockToFlow = (year) => {
  const halfLife = Math.floor((year - 2009) / 4);
  const totalSupply = 21000000 * (1 - Math.pow(0.5, halfLife));
  const annualSupply = 328500 * Math.pow(0.5, halfLife);
  
  return totalSupply / annualSupply;
};

/**
 * 現在価格とパワーロー予測を比較
 * @param {number} currentPrice - 現在の価格（USD）
 * @returns {Object} 比較結果
 */
export const compareToPowerLaw = (currentPrice) => {
  const currentYear = new Date().getFullYear();
  const currentStockToFlow = calculateStockToFlow(currentYear);
  const powerLawPrices = calculatePowerLawPrice(currentStockToFlow);
  
  return {
    currentPrice,
    powerLawPrice: powerLawPrices.predicted,
    bottomPrice: powerLawPrices.bottom,
    deviation: (currentPrice / powerLawPrices.predicted - 1) * 100
  };
};
