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

export const formatYen = (
  value: number | null | undefined,
  decimals: number = 2
): string => {
  if (value === null || value === undefined || isNaN(value)) return '-';

  try {
    if (value >= 100000000) {
      const billionYen = value / 100000000;
      return `${billionYen.toFixed(decimals)}億円`;
    } else if (value >= 10000) {
      const tenThousandYen = value / 10000;
      return `${tenThousandYen.toFixed(decimals)}万円`;
    } else {
      return `${value.toFixed(0)}円`;
    }
  } catch (error) {
    console.error("Yen formatting error:", error);
    return `${value}円`;
  }
};