import { useState, useEffect } from 'react';
import { coingeckoClient } from '../api/coingecko';

export const useBitcoinPrice = () => {
  const [data, setData] = useState({
    price: null,
    history: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [current, history] = await Promise.all([
          coingeckoClient.getCurrentPrice(),
          coingeckoClient.getPriceHistory()
        ]);

        if (mounted) {
          setData({
            price: current.prices,
            history,
            loading: false,
            error: null
          });
        }
      } catch (err) {
        if (mounted) {
          setData(prev => ({
            ...prev,
            loading: false,
            error: err.message
          }));
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // 1分ごとに更新

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return data;
};
