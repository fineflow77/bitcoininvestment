// src/hooks/useBitcoinPrice.js
import { useState, useEffect } from 'react';
import { useExchangeRate } from './useExchangeRate';

const CACHE_TIME = 5 * 60 * 1000; // 5分

const cache = {
  data: null,
  timestamp: null,
};

export const useBitcoinPrice = () => { // 正しく export されている
  const [bitcoinPriceData, setBitcoinPriceData] = useState({
    loading: true,
    currentPrice: null,
    error: null,
  });
  const exchangeRateData = useExchangeRate();

  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      // キャッシュチェック
      if (cache.data && cache.timestamp && Date.now() - cache.timestamp < CACHE_TIME) {
        console.log('価格データ：キャッシュから取得');
        setBitcoinPriceData(prev => ({ ...prev, currentPrice: cache.data, error: null }));
      } else {
        // キャッシュがない、または古い場合はローディング状態にする
        setBitcoinPriceData(prev => ({ ...prev, loading: true, error: null }));
      }

      try {
        console.log('価格データ：APIリクエスト開始');
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        console.log('APIレスポンス:', response);

        if (!response.ok) {
          console.error('APIレスポンスエラー:', response.status, response.statusText);
          throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('APIデータ:', data);

        if (!data || typeof data.price !== 'string') {
          console.error('APIデータ形式エラー: price プロパティが見つからないか、文字列ではありません', data);
          throw new Error('APIから不正な形式の価格データが返されました');
        }

        const usdPrice = parseFloat(data.price);
        console.log('parseFloat(data.price) の結果:', usdPrice);

        if (isNaN(usdPrice)) {
          console.error('parseFloatエラー: 数値に変換できません', data.price);
          throw new Error('APIから無効な価格データが返されました');
        }

        const jpyPrice = usdPrice * exchangeRateData.exchangeRate;

        const prices = {
          usd: usdPrice,
          jpy: jpyPrice,
        };
        const currentPrice = { prices, timestamp: Date.now() };
        cache.data = currentPrice;
        cache.timestamp = Date.now();
        setBitcoinPriceData({ loading: false, currentPrice: currentPrice, error: null });
        console.log('価格データ取得成功:', currentPrice);

      } catch (error) {
        console.error("Bitcoin価格の取得に失敗しました (useBitcoinPrice):", error);
        setBitcoinPriceData(prev => ({ ...prev, loading: false, error: error })); // エラーオブジェクトを格納
      }
    };

    fetchBitcoinPrice();
    const intervalId = setInterval(fetchBitcoinPrice, 60000); // 1分ごとに更新

    return () => clearInterval(intervalId);
  }, [exchangeRateData.exchangeRate]);

  return bitcoinPriceData;
};