import { useState, useEffect } from 'react';
import { binanceClient } from '../api/binance';

export const useExchangeRate = () => {
    const [exchangeRateData, setExchangeRateData] = useState({
        exchangeRate: 150, // 初期値はまだ設定、ローディング中に使用
        loading: true,
        error: null
    });

    useEffect(() => {
        let mounted = true;

        const fetchExchangeRate = async () => {
            try {
                const currentPriceData = await binanceClient.getCurrentPrice();
                if (!mounted) return;

                if (!currentPriceData || !currentPriceData.prices || !currentPriceData.prices.exchangeRate) {
                    throw new Error('為替レートデータの取得に失敗');
                }

                setExchangeRateData({
                    exchangeRate: currentPriceData.prices.exchangeRate,
                    loading: false,
                    error: null
                });
            } catch (err) {
                if (!mounted) return;
                console.error('為替レートの取得に失敗:', err);
                setExchangeRateData({
                    exchangeRate: 150, // エラー時のデフォルト値
                    loading: false,
                    error: err.message || '為替レートの取得に失敗'
                });
            }
        };

        fetchExchangeRate();
        const interval = setInterval(fetchExchangeRate, 300000); // 5 分ごとにリフレッシュ

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    return exchangeRateData;
};