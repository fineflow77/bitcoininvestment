const BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

export const yahooClient = {
 /**
  * USD/JPYの為替レートを取得
  */
 async getExchangeRate() {
   try {
     const response = await fetch(`${BASE_URL}/USDJPY=X`);
     if (!response.ok) throw new Error('Failed to fetch exchange rate');
     
     const data = await response.json();
     const currentPrice = data.chart.result[0].meta.regularMarketPrice;
     
     return currentPrice;
   } catch (error) {
     console.error('Yahoo finance fetch error:', error);
     return 150; // フォールバック値
   }
 }
};
