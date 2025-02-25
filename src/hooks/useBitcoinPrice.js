import { useState, useEffect } from 'react';
import { binanceClient } from '../api/binance';

export const useBitcoinPrice = () => {
  const [data, setData] = useState({
    currentPrice: null, // 現在価格データ用に名前を変更
    priceHistory: [], // 履歴価格データ用に名前を変更
    loading: true,
    error: null
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [currentPrice, priceHistory] = await Promise.all([
          binanceClient.getCurrentPrice(),
          binanceClient.getPriceHistory()
        ]);

        if (!mounted) return;

        if (!currentPrice) throw new Error('現在価格の取得に失敗');
        if (!priceHistory) throw new Error('履歴価格の取得に失敗');

        setData({
          currentPrice: currentPrice,
          priceHistory: priceHistory.data,
          loading: false,
          error: null
        });
      } catch (err) {
        if (!mounted) return;
        console.error('ビットコイン価格データの取得に失敗:', err);
        setData({
          currentPrice: null,
          priceHistory: [],
          loading: false,
          error: err.message || 'ビットコイン価格データの取得に失敗'
        });
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return data;
};