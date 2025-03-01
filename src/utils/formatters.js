// src/utils/formatters.js
/**
 * 通貨フォーマット (USDとJPYに対応)
 * @param {number} value - 数値
 * @param {string} [currency='JPY'] - 通貨 ('USD' または 'JPY')。デフォルトは 'JPY'
 * @returns {string} フォーマットされた通貨文字列
 */
export const formatCurrency = (value, currency = 'JPY') => {
    if (!value) return currency === 'USD' ? '$0' : '0円';

    const symbol = currency === 'USD' ? '$' : '¥';

    if (currency === 'JPY') {
        if (value >= 1e8) return `${(value / 1e8).toFixed(2)}億円`;
        if (value >= 1e4) {
            const manValue = Math.floor(value / 1e4);
            // 1000万円以上は整数で表示（例：1234万円, 元のコードに合わせた）
            if (manValue >= 1000) {
                return `¥${Math.floor(manValue)}万円`;
            }
            return `¥${manValue}万円`;
        }
        return `¥${Math.floor(value)}円`;
    } else { // currency === 'USD'
        if (value < 0.01) return `${symbol}${value.toFixed(6)}`;
        if (value < 1) return `${symbol}${value.toFixed(4)}`;
        if (value < 10) return `${symbol}${value.toFixed(2)}`;
        if (value < 1000) return `${symbol}${Math.round(value)}`;
        if (value < 10000) return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
        if (value < 1000000) return `${symbol}${(value / 1000).toFixed(1)}k`;
        if (value < 1000000000) return `${symbol}${(value / 1000000).toFixed(1)}M`;
        return `${symbol}${(value / 1000000000).toFixed(1)}B`;
    }
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