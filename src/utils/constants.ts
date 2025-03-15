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

export enum PriceModel {
  STANDARD = 'standard',
  CONSERVATIVE = 'conservative',
}

export const PriceModelConfig = {
  [PriceModel.STANDARD]: {
    name: '標準モデル',
    targetValueUSD: 10000000,
    description: 'HC Burgerが提唱するパワーロー方程式を基に、2039年以降滑らかに減衰し2050年で1000万ドルに到達。ビットコインが基軸通貨になるシナリオ。',
  },
  [PriceModel.CONSERVATIVE]: {
    name: '保守的モデル',
    targetValueUSD: 4000000,
    description: '控えめに調整し、2050年で400万ドルに到達。ビットコインがゴールドの4倍の時価総額になるシナリオ。',
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