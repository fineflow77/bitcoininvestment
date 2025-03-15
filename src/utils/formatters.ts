// src/utils/formatters.ts

/**
 * 通貨金額をフォーマットする関数
 * @param value フォーマットする金額
 * @param currency 通貨コード ('JPY' または 'USD')
 * @param options フォーマット用オプション
 * @returns フォーマットされた金額文字列
 */
export const formatCurrency = (
  value: number | null | undefined,
  currency: string = "USD",
  options: { maxDecimals?: number; minDecimals?: number } = {}
): string => {
  if (value === null || value === undefined || isNaN(value)) return '-';

  const { maxDecimals = 0, minDecimals = 0 } = options;

  try {
    const formatter = new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: maxDecimals,
      minimumFractionDigits: minDecimals
    });
    return formatter.format(value);
  } catch (error) {
    console.error("Currency formatting error:", error);
    const symbol = currency === "JPY" ? "¥" : "$";
    return `${symbol}${value.toLocaleString('ja-JP', {
      maximumFractionDigits: maxDecimals,
      minimumFractionDigits: minDecimals
    })}`;
  }
};

/**
 * BTC数量をフォーマットする関数（satoshi, μBTC 除外）
 * @param value フォーマットするBTC数量
 * @param digits 表示する小数点以下の桁数
 * @param includeUnit 単位(BTC)を含めるかどうか
 * @returns フォーマットされたBTC数量文字列
 */
export const formatBTC = (
  value: number | null | undefined,
  digits: number = 8,
  includeUnit: boolean = true
): string => {
  if (value === null || value === undefined || isNaN(value)) return '-';

  try {
    return `${value.toFixed(digits)} ${includeUnit ? 'BTC' : ''}`.trim();
  } catch (error) {
    console.error("BTC formatting error:", error);
    return `${value} ${includeUnit ? 'BTC' : ''}`.trim();
  }
};

/**
 * パーセント値をフォーマットする関数
 * @param value フォーマットするパーセント値
 * @param decimals 小数点以下の桁数
 * @param includeSign プラス記号を含めるかどうか
 * @returns フォーマットされたパーセント文字列
 */
export const formatPercentage = (
  value: number | null | undefined,
  decimals: number = 1,
  includeSign: boolean = true
): string => {
  if (value === null || value === undefined || isNaN(value)) return '-';

  try {
    const prefix = includeSign && value > 0 ? '+' : '';
    return `${prefix}${value.toFixed(decimals)}%`;
  } catch (error) {
    console.error("Percentage formatting error:", error);
    return `${value}%`;
  }
};

/**
 * 日付をフォーマットする関数
 * @param date フォーマットする日付
 * @param format フォーマット形式 ('short', 'medium', 'long')
 * @returns フォーマットされた日付文字列
 */
export const formatDate = (
  date: Date | string | number | null | undefined,
  format: 'short' | 'medium' | 'long' = 'medium'
): string => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'object' ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return '-';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: format === 'short' ? 'numeric' : 'long',
      day: 'numeric'
    };
    if (format === 'long') {
      options.weekday = 'long';
    }
    return dateObj.toLocaleDateString('ja-JP', options);
  } catch (error) {
    console.error("Date formatting error:", error);
    return String(date);
  }
};

/**
 * 円を適切な単位（億円、万円、円）でフォーマットする関数
 * @param value フォーマットする金額（円）
 * @param decimals 小数点以下の桁数（億円と万円のみ適用）
 * @returns フォーマットされた文字列（例: "53.43億円", "5343万円", "351円"）
 */
export const formatYen = (
  value: number | null | undefined,
  decimals: number = 2
): string => {
  if (value === null || value === undefined || isNaN(value)) return '-';

  try {
    if (value >= 100000000) { // 1億円以上
      const billionYen = value / 100000000;
      return `${billionYen.toFixed(decimals)}億円`;
    } else if (value >= 10000) { // 1万円以上
      const tenThousandYen = value / 10000;
      return `${tenThousandYen.toFixed(decimals)}万円`;
    } else { // 1万円未満
      return `${value.toFixed(0)}円`;
    }
  } catch (error) {
    console.error("Yen formatting error:", error);
    return `${value}円`;
  }
};