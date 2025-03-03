/**
 * 金額をフォーマットする
 * @param {number} value - フォーマットする金額
 * @param {string} currency - 通貨コード ('USD', 'JPY')
 * @returns {string} フォーマットされた金額
 */
export const formatCurrency = (value, currency = 'USD') => {
    // null, undefined, NaN チェックを強化
    if (value === null || value === undefined || isNaN(value)) {
        return '-';
    }

    // 値を数値型に変換（文字列が渡された場合に対応）
    const numericValue = Number(value);

    // 数値変換後も念のためチェック
    if (isNaN(numericValue)) {
        return '-';
    }

    const options = {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    };

    // 1000未満の場合、小数点以下を表示
    if (Math.abs(numericValue) < 1000) {
        options.minimumFractionDigits = 2;
        options.maximumFractionDigits = 2;
    }

    // 100未満の場合、さらに多くの小数点以下を表示
    if (Math.abs(numericValue) < 100) {
        options.minimumFractionDigits = 2;
        options.maximumFractionDigits = 4;
    }

    // 1未満の場合、最大4桁の小数点以下を表示
    if (Math.abs(numericValue) < 1) {
        options.minimumFractionDigits = 2;
        options.maximumFractionDigits = 4;
    }

    try {
        return new Intl.NumberFormat('ja-JP', options).format(numericValue);
    } catch (error) {
        console.error('Error formatting currency value:', numericValue, error);
        return '-';
    }
};

/**
 * ビットコイン数量をフォーマットする
 * @param {number} value - フォーマットするBTC数量
 * @param {number} maxDecimals - 最大小数点以下桁数（デフォルト: 8）
 * @returns {string} フォーマットされたBTC数量
 */
export const formatBTC = (value, maxDecimals = 8) => {
    // null, undefined, NaN チェック
    if (value === null || value === undefined || isNaN(value)) {
        return '-';
    }

    // 値を数値型に変換
    const numericValue = Number(value);

    // 数値変換後も念のためチェック
    if (isNaN(numericValue)) {
        return '-';
    }

    try {
        // 値の大きさに応じて小数点以下の桁数を調整
        let decimals = maxDecimals;

        if (Math.abs(numericValue) >= 100) {
            decimals = Math.min(1, maxDecimals); // 100 BTC以上は小数点以下1桁まで
        } else if (Math.abs(numericValue) >= 10) {
            decimals = Math.min(2, maxDecimals); // 10 BTC以上は小数点以下2桁まで
        } else if (Math.abs(numericValue) >= 1) {
            decimals = Math.min(4, maxDecimals); // 1 BTC以上は小数点以下4桁まで
        }

        // 数値を文字列にフォーマット
        const formattedValue = numericValue.toLocaleString('ja-JP', {
            minimumFractionDigits: 0,
            maximumFractionDigits: decimals
        });

        // 単位を追加
        return `${formattedValue} BTC`;
    } catch (error) {
        console.error('Error formatting BTC value:', numericValue, error);
        return '-';
    }
};