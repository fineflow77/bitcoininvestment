/**
 * 通貨フォーマット
 * @param {number} value
 * @returns {string}
 */
export const formatCurrency = (value) => {
    if (!value) return "0";
    if (value >= 1e8) return `${(value / 1e8).toFixed(2)}億円`;
    if (value >= 1e4) {
        const manValue = Math.floor(value / 1e4);
        if (manValue >= 1000) {
            return `${Math.floor(manValue)}万円`;
        } else {
            return `${manValue}万円`;
        }
    }
    return `${Math.floor(value)}円`;
};
/**
 * パーセント表示
 * @param {number} value
 * @returns {string}
 */
export const formatPercent = (value) => `${parseFloat(value).toFixed(2)}%`;

/**
 * BTC数量フォーマット
 * @param {number} value
 * @returns {string}
 */
export const formatBTC = (value) => parseFloat(value).toFixed(4);

/**
 * 年フォーマット
 * @param {number} year
 * @returns {string}
 */
export const formatYear = (year) => `${year}年`;