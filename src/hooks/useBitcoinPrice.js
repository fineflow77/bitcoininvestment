// src/hooks/useBitcoinPrice.js
import { useState, useEffect, useRef } from 'react';
import { useExchangeRate } from './useExchangeRate';

const CACHE_TIME = 5 * 60 * 1000; // 5分
const API_POLL_INTERVAL = 60 * 1000; // 1分 (必要に応じて調整)
const API_TIMEOUT = 10 * 1000; // 10秒 (fetchのタイムアウト)

export const useBitcoinPrice = () => {
  const [bitcoinPriceData, setBitcoinPriceData] = useState({
    loading: true,
    currentPrice: null,
    error: null,
  });
  const exchangeRateData = useExchangeRate();
  const cache = useRef({ // useRef を使用してキャッシュを管理
    data: null,
    timestamp: null,
  });

  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      // キャッシュチェック
      if (cache.current.data && cache.current.timestamp && Date.now() - cache.current.timestamp < CACHE_TIME) {
        console.log('価格データ：キャッシュから取得');
        setBitcoinPriceData(prev => ({ ...prev, loading: false, error: null, currentPrice: cache.current.data }));
        return; // キャッシュがある場合はここで終了
      }

      console.log('価格データ：APIリクエスト開始');
      setBitcoinPriceData(prev => ({ ...prev, loading: true, error: null })); // ローディング状態

      const controller = new AbortController(); // AbortController を作成
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT); // タイムアウト設定

      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', {
          signal: controller.signal // AbortController の signal を fetch に渡す
        });
        clearTimeout(timeoutId); // タイムアウトをクリア

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data || typeof data.price !== 'string') {
          throw new Error('APIから不正な形式の価格データが返されました');
        }

        const usdPrice = parseFloat(data.price);
        if (isNaN(usdPrice)) {
          throw new Error('APIから無効な価格データが返されました');
        }

        const jpyPrice = usdPrice * exchangeRateData.exchangeRate;
        const prices = { usd: usdPrice, jpy: jpyPrice };
        const currentPrice = { prices, timestamp: Date.now() };

        cache.current.data = currentPrice; // キャッシュを更新
        cache.current.timestamp = Date.now();

        setBitcoinPriceData({ loading: false, currentPrice, error: null });
        console.log('価格データ取得成功:', currentPrice);

      } catch (error) {
        console.error("Bitcoin価格の取得に失敗しました (useBitcoinPrice):", error);

        // AbortError の場合は、タイムアウトによるものなので、エラーメッセージを変更
        if (error.name === 'AbortError') {
          setBitcoinPriceData(prev => ({ ...prev, loading: false, error: new Error('APIリクエストがタイムアウトしました') }));
        } else {
          setBitcoinPriceData(prev => ({ ...prev, loading: false, error })); // loading: false のまま
        }

      }
    };

    fetchBitcoinPrice(); // 初回実行

    const intervalId = setInterval(fetchBitcoinPrice, API_POLL_INTERVAL); // 定期実行

    return () => {
      clearInterval(intervalId); // クリーンアップ関数でタイマーを解除
      // AbortController を使用している場合は、ここで abort() を呼ぶ必要はありません。
      // fetch が中断されると、自動的に AbortError が発生します。
    };
  }, [exchangeRateData]); // 依存配列に exchangeRateData 全体を追加

  return bitcoinPriceData;
};