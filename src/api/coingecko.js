const BASE_URL = 'https://api.coingecko.com/api/v3';

/**
 * CoinGecko APIクライアント
 */
export const coingeckoClient = {
  /**
   * ビットコインの現在価格を取得
   */
  async getCurrentPrice() {
    try {
      const response = await fetch(
        `${BASE_URL}/simple/price?ids=bitcoin&vs_currencies=usd,jpy&include_24hr_change=true`
      );
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      return {
        prices: {
          usd: data.bitcoin.usd,
          jpy: data.bitcoin.jpy,
          usd_24h_change: data.bitcoin.usd_24h_change,
          jpy_24h_change: data.bitcoin.jpy_24h_change
        }
      };
    } catch (error) {
      console.error('Bitcoin price fetch error:', error);
      throw error;
    }
  },

  /**
   * ビットコインの価格履歴を取得
   */
  async getPriceHistory(days = '30') {
    try {
      const response = await fetch(
        `${BASE_URL}/coins/bitcoin/market_chart?vs_currency=jpy&days=${days}&interval=daily`
      );
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      return data.prices.map(([timestamp, price]) => ({
        date: new Date(timestamp),
        price
      }));
    } catch (error) {
      console.error('Historical data fetch error:', error);
      throw error;
    }
  }
};
