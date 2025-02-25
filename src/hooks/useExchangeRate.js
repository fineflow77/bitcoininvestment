import { useState, useEffect } from 'react'; // import 文をファイルの先頭に移動

// キャッシュ時間 (30分) 為替レートは変動が少ないため長めに設定
const CACHE_TIME = 30 * 60 * 1000;
const cache = {
    data: null,
    timestamp: null,
};

export const useExchangeRate = () => {
    const [exchangeRateData, setExchangeRateData] = useState({
        loading: false,
        exchangeRate: 150.00, // デフォルト値を設定
        error: null,
    });

    useEffect(() => {
        const fetchExchangeRate = async () => {
            setExchangeRateData({ ...exchangeRateData, loading: true, error: null });

            // キャッシュがあればそれを返す
            if (cache.data && cache.timestamp && Date.now() - cache.timestamp < CACHE_TIME) {
                console.log('為替レート：キャッシュから取得');
                setExchangeRateData({ loading: false, exchangeRate: cache.data, error: null });
                return;
            }

            try {
                console.log('為替レート：APIリクエスト');
                const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const rate = data.rates.JPY;
                cache.data = rate;
                cache.timestamp = Date.now();
                setExchangeRateData({ loading: false, exchangeRate: rate, error: null });
            } catch (error) {
                console.error("為替レートの取得に失敗しました", error);
                setExchangeRateData({ loading: false, exchangeRate: 150.00, error: error }); // エラー時もデフォルト値を維持
            }
        };

        fetchExchangeRate();
    }, []);

    return exchangeRateData;
};