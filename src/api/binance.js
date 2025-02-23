const BASE_URL = 'https://api.binance.com/api/v3';

export const binanceClient = {
  /**
   * BTCの現在価格を取得
   */
  async getCurrentPrice() {
    try {
      // BTCUSDTの価格を取得
      const response = await fetch(`${BASE_URL}/ticker/price?symbol=BTCUSDT`);
      if (!response.ok) throw new Error('Failed to fetch BTC price');
      const btcData = await response.json();
      
      // USDTJPYの価格を取得（または固定レートを使用）
      const usdJpy = 150; // 固定レート。必要に応じて他のAPIから取得可能
      
      const usdPrice = parseFloat(btcData.price);
      const jpyPrice = usdPrice * usdJpy;

      return {
        prices: {
          usd: usdPrice,
          jpy: jpyPrice,
          usd_24h_change: 0,  // 必要な場合は24時間の変化率APIも利用可能
          jpy_24h_change: 0
        }
      };
    } catch (error) {
      console.error('Binance price fetch error:', error);
      return null;
    }
  },

  /**
   * BTCの価格履歴を取得
   */
  async getPriceHistory(days = '30') {
    try {
      // 1日のミリ秒
      const DAY_IN_MS = 24 * 60 * 60 * 1000;
      const endTime = Date.now();
      const startTime = endTime - (days * DAY_IN_MS);
      
      const response = await fetch(
        `${BASE_URL}/klines?symbol=BTCUSDT&interval=1d&startTime=${startTime}&endTime=${endTime}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch price history');
      const data = await response.json();
      
      // Binanceの応答を必要なフォーマットに変換
      return data.map(candle => ({
        date: new Date(candle[0]),  // 開始時間
        price: parseFloat(candle[4]) * 150  // 終値 * 為替レート
      }));
    } catch (error) {
      console.error('Binance history fetch error:', error);
      return [];
    }
  }
};
