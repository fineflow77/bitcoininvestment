import { differenceInDays, format } from 'date-fns';
import { ja } from 'date-fns/locale';

// ビットコイン創設日
export const BITCOIN_GENESIS_DATE = new Date(2009, 0, 3);

/**
 * 創設からの日数を計算
 * @param {Date} date - 計算する日付
 * @returns {number} 創設からの日数
 */
export const getDaysSinceGenesis = (date) => differenceInDays(date, BITCOIN_GENESIS_DATE);

/**
 * ISO形式の日付文字列を返す
 * @param {string|Date} dateStr - 日付文字列またはDateオブジェクト
 * @returns {string} ISO形式の日付
 */
export const toISODate = (dateStr) => {
    const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
    return date.toISOString().split('T')[0];
};

/**
 * 日本語の日付フォーマット (yyyy年MM月dd日)
 * @param {string|Date} dateStr - 日付文字列またはDateオブジェクト
 * @returns {string} フォーマットされた日付
 */
export const toJapaneseDate = (dateStr) => {
    const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
    return format(date, 'yyyy年MM月dd日', { locale: ja });
};

/**
 * 短い日本語の日付フォーマット (MM月dd日)
 * @param {string|Date} dateStr - 日付文字列またはDateオブジェクト
 * @returns {string} フォーマットされた日付
 */
export const toShortJapaneseDate = (dateStr) => {
    const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
    return format(date, 'MM月dd日', { locale: ja });
};

/**
 * 選択範囲からインデックス範囲を計算
 * @param {Array} data - データ配列
 * @param {string} range - 選択範囲 ('all', '10y', '5y', '2y', '1y', '6m')
 * @returns {Object} 表示する開始・終了インデックス
 */
export const calculateDateRange = (data, range) => {
    if (!data || data.length === 0) return { startIndex: 0, endIndex: 0 };

    const endIndex = data.length - 1;
    let startIndex = 0;
    const today = new Date();

    switch (range) {
        case '10y':
            const tenYearsAgo = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
            startIndex = Math.max(0, data.findIndex(item => new Date(item[0]) >= tenYearsAgo));
            break;
        case '5y':
            const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
            startIndex = Math.max(0, data.findIndex(item => new Date(item[0]) >= fiveYearsAgo));
            break;
        case '2y':
            const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
            startIndex = Math.max(0, data.findIndex(item => new Date(item[0]) >= twoYearsAgo));
            break;
        case '1y':
            const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
            startIndex = Math.max(0, data.findIndex(item => new Date(item[0]) >= oneYearAgo));
            break;
        case '6m':
            const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
            startIndex = Math.max(0, data.findIndex(item => new Date(item[0]) >= sixMonthsAgo));
            break;
        case 'all':
        default:
            startIndex = 0;
            break;
    }

    return { startIndex, endIndex };
};