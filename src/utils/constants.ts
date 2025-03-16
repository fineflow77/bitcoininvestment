export const DEFAULTS = {
  TAX_RATE: 20.315,
  EXCHANGE_RATE: 150,
  INFLATION_RATE: 0,
  INITIAL_INVESTMENT: 100000,
  INITIAL_BTC_HOLDING: 0.1,
  MONTHLY_INVESTMENT: 10000,
  YEARS: 10,
};

export const START_YEAR: number = 2009;
export const TRANSITION_START_YEAR: number = 2039;
export const TARGET_YEAR: number = 2050;
export const CURRENT_YEAR: number = 2025;

export const CHART_TIME_RANGE = {
  START_DATE: new Date('2009-01-03'), // ビットコインのジェネシスブロック
  END_DATE: new Date('2040-12-31'),   // チャート表示の終了点
  DISPLAY_START_DATE: new Date('2010-07-18'), // 表示開始点
};

export const TIME_INTERVALS = {
  DAY_MS: 24 * 60 * 60 * 1000,
  WEEK_MS: 7 * 24 * 60 * 60 * 1000,
};

export enum PriceModel {
  STANDARD = 'standard',
  CONSERVATIVE = 'conservative',
}

export const PriceModelConfig = {
  [PriceModel.STANDARD]: {
    name: '標準モデル',
    targetValueUSD: 10000000,
    description: 'HC Burgerが提唱するパワーロー方程式を基に、2039年以降滑らかに減衰し2050年で1000万ドルに到達。',
  },
  [PriceModel.CONSERVATIVE]: {
    name: '保守的モデル',
    targetValueUSD: 4000000,
    description: '控えめに調整し、2050年で400万ドルに到達。',
  },
} as const;

export const CACHE_EXPIRY = {
  PRICE: 5 * 60 * 1000,
  DAILY: 60 * 60 * 1000,
  EXCHANGE_RATE: 60 * 60 * 1000,
};

export const HALVING_EVENTS: { date: Date; label: string }[] = [
  { date: new Date('2012-11-28'), label: '第1回' },
  { date: new Date('2016-07-09'), label: '第2回' },
  { date: new Date('2020-05-11'), label: '第3回' },
  { date: new Date('2024-04-20'), label: '第4回' },
];