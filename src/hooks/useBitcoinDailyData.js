import { useState, useEffect, useRef } from 'react';
import { useExchangeRate } from './useExchangeRate';
import { apiRequest } from '../utils/apiUtils';

const CACHE_TIME = 60 * 60 * 1000; // 1時間
const DAILY_POLL_INTERVAL = 24 * 60 * 60 * 1000; // 1日
const PRICE_POLL_INTERVAL = 60 * 1000; // 1分
const API_TIMEOUT = 10 * 1000; // 10秒

export const useBitcoinDailyData = () => {
    const [data, setData] = useState({ loading: true, dailyPrices: [], currentPrice: null, error: null });
    const exchangeRateData = useExchangeRate();
    const cache = useRef({ data: null, timestamp: null });

    useEffect(() => {
        const fetchData = async () => {
            if (cache.current.data && Date.now() - cache.current.timestamp < CACHE_TIME) {
                setData(prev => ({ ...prev, ...cache.current.data, loading: false, error: null }));
                return;
            }

            setData(prev => ({ ...prev, loading: true }));
            try {
                // 日次データ (2024-01-01以降)
                const startTime = new Date('2024-01-01T00:00:00Z').getTime();
                const dailyRes = await apiRequest(
                    'GET',
                    'https://api.binance.com/api/v3/klines',
                    { symbol: 'BTCUSDT', interval: '1d', startTime },
                    null,
                    API_TIMEOUT
                );
                const dailyPrices = dailyRes.map(item => ({
                    date: new Date(item[0]).toISOString().split('T')[0],
                    price: parseFloat(item[4]), // 終値
                }));

                // 現在価格
                const priceRes = await apiRequest(
                    'GET',
                    'https://api.binance.com/api/v3/ticker/price',
                    { symbol: 'BTCUSDT' },
                    null,
                    API_TIMEOUT
                );
                const usdPrice = parseFloat(priceRes.price);
                const currentPrice = {
                    prices: { usd: usdPrice, jpy: usdPrice * exchangeRateData.exchangeRate },
                    timestamp: Date.now(),
                };

                const result = { dailyPrices, currentPrice };
                cache.current = { data: result, timestamp: Date.now() };
                setData({ loading: false, dailyPrices, currentPrice, error: null });
            } catch (error) {
                setData(prev => ({ ...prev, loading: false, error: error.message }));
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, PRICE_POLL_INTERVAL);
        return () => clearInterval(intervalId);
    }, [exchangeRateData.exchangeRate]);

    return data;
};

export default useBitcoinDailyData;