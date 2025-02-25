import { useState, useEffect } from 'react';

// キャッシュ時間 (5分)
const CACHE_TIME = 5 * 60 * 1000;
const cache = {
  data: null,
  timestamp: null,
};

export const useBitcoinPrice = () => {
  const [bitcoinPriceData, setBitcoinPriceData] = useState({
    loading: false,
    currentPrice: null,
    error: null,
  });

  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      setBitcoinPriceData({ loading: true, currentPrice: null, error: null });

      // キャッシュがあればそれを返す
      if (cache.data && cache.timestamp && Date.now() - cache.timestamp < CACHE_TIME) {
        console.log('価格データ：キャッシュから取得');
        setBitcoinPriceData({ loading: false, currentPrice: cache.data, error: null });
        return;
      }

      try {
        console.log('価格データ：APIリクエスト開始'); // リクエスト開始ログ
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        console.log('APIレスポンス:', response); // APIレスポンス全体をログ出力

        if (!response.ok) {
          console.error('APIレスポンスエラー:', response.status, response.statusText); // エラーレスポンスをログ出力
          throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('APIデータ:', data); // APIデータ全体をログ出力

        if (!data || typeof data.price === 'undefined') {
          console.error('APIデータ形式エラー: price プロパティが見つかりません', data); // データ形式エラーをログ出力
          throw new Error('APIから不正な形式の価格データが返されました');
        }

        const usdPrice = parseFloat(data.price);
        console.log('parseFloat(data.price) の結果:', usdPrice); // parseFloatの結果をログ出力

        if (isNaN(usdPrice)) {
          console.error('parseFloatエラー: 数値に変換できません', data.price); // parseFloat 失敗をログ出力
          throw new Error('APIから無効な価格データが返されました');
        }

        const prices = {
          usd: usdPrice,
          jpy: 0, // JPY価格は後で為替レートと組み合わせて計算
        };
        const currentPrice = { prices };
        cache.data = currentPrice;
        cache.timestamp = Date.now();
        setBitcoinPriceData({ loading: false, currentPrice: currentPrice, error: null });
        console.log('価格データ取得成功:', currentPrice); // データ取得成功をログ出力

      } catch (error) {
        console.error("Bitcoin価格の取得に失敗しました (useBitcoinPrice):", error);
        setBitcoinPriceData({ loading: false, currentPrice: null, error: error });
      }
    };

    fetchBitcoinPrice();
  }, []);

  return bitcoinPriceData;
};