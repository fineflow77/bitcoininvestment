import { useState, useEffect } from 'react';
import { binanceClient } from '../api/binance';

export const useBitcoinPrice = () => {
  const [data, setData] = useState({
    price: null,
    history: [],
    exchangeRate: 150, // 初期値として150を設定
    loading: true,
    error: null
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        // 価格データと履歴データを並行して取得
        const [current, history] = await Promise.all([
          binanceClient.getCurrentPrice(),
          binanceClient.getPriceHistory()
        ]);

        if (!mounted) return;

        if (!current) throw new Error('Failed to fetch current price');

        setData({
          price: current,
          history: history.data,
          exchangeRate: current.prices.exchangeRate || history.exchangeRate || 150, // 為替レートを保存
          loading: false,
          error: null
        });
      } catch (err) {
        if (!mounted) return;

        setData(prev => ({
          ...prev,
          loading: false,
          error: err.message
        }));
      }
    };

    fetchData();
    // 1分ごとに更新
    const interval = setInterval(fetchData, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return data;
};