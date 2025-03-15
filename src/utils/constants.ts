/**
 * プロジェクト全体で使用される定数
 */

// デフォルト値
export const DEFAULTS = {
  /** 税率のデフォルト値 (%) */
  TAX_RATE: 20.315,
  /** 為替レートのデフォルト値 (円/USD) */
  EXCHANGE_RATE: 150,
  /** インフレ率のデフォルト値 (%) */
  INFLATION_RATE: 0,
};

// 一般的な定数
/** ビットコイン誕生年 */
export const START_YEAR: number = 2009;
/** パワーロー緩和開始年 */
export const TRANSITION_START_YEAR: number = 2039;
/** シミュレーション終了目標年 */
export const TARGET_YEAR: number = 2050;
/** 現在の年 */
export const CURRENT_YEAR: number = new Date().getFullYear();

/**
 * パワーロー予測モデルの種類
 */
export enum PriceModel {
  /** 標準モデル（2050年に1000万USD） */
  STANDARD = 'standard',
  /** 保守的モデル（2050年に400万USD） */
  CONSERVATIVE = 'conservative'
}

/**
 * データキャッシュの有効期限（ミリ秒）
 */
export const CACHE_EXPIRY = {
  /** 価格データの有効期限 (5分) */
  PRICE: 5 * 60 * 1000,
  /** 日次データの有効期限 (1時間) */
  DAILY: 60 * 60 * 1000,
  /** 為替レートの有効期限 (1時間) */
  EXCHANGE_RATE: 60 * 60 * 1000,
};

/**
 * ハルビングイベントの日付情報
 */
export const HALVING_EVENTS: { date: string; label: string }[] = [
  { date: '2012-11-28', label: '第1回' },
  { date: '2016-07-09', label: '第2回' },
  { date: '2020-05-11', label: '第3回' },
  { date: '2024-04-20', label: '第4回' },
];