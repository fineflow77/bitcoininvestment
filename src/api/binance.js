const BASE_URL = 'https://api.binance.com/api/v3';

export const binanceClient = {
  /**
   * JPY/USD為替レートを取得（USDC/JPYから計算）
   */
  async getExchangeRate() {
    try {
      // 最初にBinanceが提供しているシンボルを確認するために、ブラウザコンソールにログ出力
      console.log('Fetching exchange rate...');

      // いくつかの可能なシンボル名を試す
      let symbols = ['USDCJPY', 'USDC_JPY', 'USDCJPY', 'BUSD_JPY', 'USDT_JPY'];
      let exchangeRate = null;

      for (const symbol of symbols) {
        try {
          console.log(`Trying symbol: ${symbol}`);
          const response = await fetch(`${BASE_URL}/ticker/price?symbol=${symbol}`);
          if (response.ok) {
            const data = await response.json();
            console.log(`Success with symbol ${symbol}:`, data);
            exchangeRate = parseFloat(data.price);
            break;
          }
        } catch (e) {
          console.log(`Failed with symbol ${symbol}:`, e);
        }
      }

      if (exchangeRate) {
        return exchangeRate;
      }

      // 代替手段：BTC/JPY ÷ BTC/USDT で計算する
      console.log('Trying alternate method using BTC pairs...');
      const [btcJpyResponse, btcUsdtResponse] = await Promise.all([
        fetch(`${BASE_URL}/ticker/price?symbol=BTCJPY`).then(res => res.ok ? res.json() : null),
        fetch(`${BASE_URL}/ticker/price?symbol=BTCUSDT`).then(res => res.ok ? res.json() : null)
      ]);

      if (btcJpyResponse && btcUsdtResponse) {
        const btcJpy = parseFloat(btcJpyResponse.price);
        const btcUsdt = parseFloat(btcUsdtResponse.price);
        const calculatedRate = btcJpy / btcUsdt;
        console.log(`Calculated rate from BTC pairs: ${calculatedRate}`);
        return calculatedRate;
      }

      throw new Error('Could not determine exchange rate');
    } catch (error) {
      console.error('Exchange rate fetch error:', error);
      return 150; // フォールバック値
    }
  },

  /**
   * BTCの現在価格を取得
   */
  async getCurrentPrice() {
    try {
      // BTCUSDTの価格とUSDC/JPYの為替レートを並行して取得
      const [btcResponse, exchangeRate] = await Promise.all([
        fetch(`${BASE_URL}/ticker/price?symbol=BTCUSDT`).then(res => {
          if (!res.ok) throw new Error('Failed to fetch BTC price');
          return res.json();
        }),
        this.getExchangeRate()
      ]);

      const usdPrice = parseFloat(btcResponse.price);
      const jpyPrice = usdPrice * exchangeRate;

      return {
        prices: {
          usd: usdPrice,
          jpy: jpyPrice,
          exchangeRate: exchangeRate, // 為替レートも返す
          usd_24h_change: 0, // 必要な場合は24時間の変化率APIも利用可能
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
      // 為替レートを取得
      const exchangeRate = await this.getExchangeRate();

      // 1日のミリ秒
      const DAY_IN_MS = 24 * 60 * 60 * 1000;
      const endTime = Date.now();
      const startTime = endTime - (parseInt(days) * DAY_IN_MS);

      const response = await fetch(
        `${BASE_URL}/klines?symbol=BTCUSDT&interval=1d&startTime=${startTime}&endTime=${endTime}`
      );

      if (!response.ok) throw new Error('Failed to fetch price history');
      const data = await response.json();

      // Binanceの応答を必要なフォーマットに変換
      return {
        data: data.map(candle => ({
          date: new Date(candle[0]), // 開始時間
          price: parseFloat(candle[4]), // 終値（USD）
          priceJPY: parseFloat(candle[4]) * exchangeRate // 終値をJPYに変換
        })),
        exchangeRate: exchangeRate // 為替レートも返す
      };
    } catch (error) {
      console.error('Binance history fetch error:', error);
      return { data: [], exchangeRate: 150 };
    }
  }
};