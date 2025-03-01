import { useState, useEffect, useCallback } from 'react';
import { subDays, format } from 'date-fns';
import {
    calculateDaysSinceGenesis,
    calculateMedianPrice,
    calculateSupportPrice,
} from '../utils/powerLawUtils'; // ユーティリティ関数を分離
import { toISODate } from '../utils/dateUtils';
import { log10 } from '../utils/mathUtils';

const GENESIS_DATE = new Date('2009-01-03');
const FORECAST_END_DATE = new Date('2040-12-31');
const BINANCE_API_CUTOFF_DATE = '2024-12-23';
const CACHE_TIME = 3 * 60 * 60 * 1000;

const useBitcoinChartData = (exchangeRate) => {
    const [chartData, setChartData] = useState({
        loading: true,
        data: null,
        error: null,
        lastUpdated: null,
        latestPrice: 0,
        previousPrice: { usd: 0, jpy: 0 }, // 前日価格もここで管理
    });

    const loadFromCache = useCallback(() => {
        // ... キャッシュからロードするロジック（省略）
        try {
            const cached = localStorage.getItem('bitcoin_chart_cache_v2'); //v2にするなど、keyを変える
            if (cached) {
                const parsedCache = JSON.parse(cached);
                if (Date.now() - parsedCache.timestamp < CACHE_TIME) {
                    return parsedCache;
                }
            }
        } catch (e) {
            console.warn('キャッシュの読み込みに失敗しました:', e);
        }
        return null;

    }, []);


    const saveToCache = useCallback((data) => {
        // ... キャッシュに保存するロジック（省略）
        try {
            localStorage.setItem('bitcoin_chart_cache_v2', JSON.stringify({ //v2
                timestamp: Date.now(),
                ...data,
            }));
        } catch (e) {
            console.warn('キャッシュの保存に失敗しました:', e);
        }

    }, []);



    const clearCache = () => {
        // ... キャッシュをクリアするロジック（省略）
        try {
            localStorage.removeItem('bitcoin_chart_cache_v2'); //v2
        } catch (e) {
            console.warn('Cache clear failed', e);
        }
    };

    const fetchData = useCallback(async () => {
        // ... データ取得ロジック（Binance API, weeklyPrices.json, 補間など）
        setChartData(prev => ({ ...prev, loading: true, error: null }));

        const cachedData = loadFromCache();
        if (cachedData) {
            setChartData({
                loading: false,
                data: cachedData.data,
                lastUpdated: new Date(cachedData.timestamp).toLocaleString(),
                latestPrice: cachedData.latestPrice,
                previousPrice: cachedData.previousPrice,
                error: null,
            });
            return;
        }

        try {
            const weeklyPricesResponse = await fetch('./weeklyPrices.json');
            if (!weeklyPricesResponse.ok) {
                const errorText = await weeklyPricesResponse.text();
                throw new Error(`Weekly prices data loading failed. Status: ${weeklyPricesResponse.status}, Text: ${errorText}`);
            }
            const weeklyPricesData = await weeklyPricesResponse.json();

            const interpolatedData = interpolateAndForecastToDaily(weeklyPricesData);
            const { recentPriceData, latestPrice } = await fetchRecentPriceData(interpolatedData);
            const combinedData = combineData(interpolatedData, recentPriceData);
            const processedData = processChartData(combinedData);
            const previousPrice = await calculatePreviousPrice(exchangeRate);

            const dataToCache = {
                data: processedData,
                latestPrice: latestPrice,
                previousPrice: previousPrice,
            };

            saveToCache(dataToCache);

            setChartData({
                loading: false,
                data: processedData,
                lastUpdated: new Date().toLocaleString(),
                latestPrice: latestPrice,
                previousPrice: previousPrice,
                error: null,
            });


        } catch (error) {
            console.error("チャートデータ取得エラー:", error);
            setChartData(prev => ({
                ...prev,
                loading: false,
                error: `データ取得エラー: ${error.message}`,
            }));
        }

    }, [exchangeRate, loadFromCache, saveToCache]);


    const fetchRecentPriceData = useCallback(async (interpolatedData) => {
        //Binance APIから最新データを取得するロジック
        let recentPriceData = [];
        let latestPrice = 0;

        try {
            // カットオフ日付以降のデータを取得する
            const cutoffDate = new Date(BINANCE_API_CUTOFF_DATE);
            const startTime = cutoffDate.getTime();

            const response = await fetch(
                `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&startTime=${startTime}&endTime=${Date.now()}`
            );

            if (!response.ok) throw new Error('Binance API response not ok');

            const binanceData = await response.json();

            // BinanceデータからBTC価格データを抽出
            recentPriceData = binanceData
                .map(([timestamp, , , , close]) => {
                    const price = parseFloat(close);
                    return {
                        date: toISODate(new Date(parseInt(timestamp))),
                        price: price > 0 ? price : undefined,
                    };
                })
                .filter(item => item.date && item.price);

            console.log("Binance API からのデータ取得成功:", recentPriceData.length, "件のデータポイント");

            if (recentPriceData.length > 0) {
                latestPrice = recentPriceData[recentPriceData.length - 1].price;
                console.log("最新価格:", latestPrice);
            }
        } catch (apiError) {
            console.warn('Binance API 取得エラー、静的データを使用します:', apiError);
            const lastInterpolatedData = interpolatedData
                .filter(item => item.price !== undefined)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

            if (lastInterpolatedData) {
                latestPrice = lastInterpolatedData.price;
            }
        }
        return { recentPriceData, latestPrice };

    }, []);


    const combineData = (interpolatedData, recentPriceData) => {
        // データを結合・上書きするロジック
        const combinedData = [...interpolatedData];

        // カットオフ日付以降のデータは上書き/追加
        if (recentPriceData.length > 0) {
            recentPriceData.forEach(apiDataPoint => {
                // 同じ日付のデータがあるか確認
                const existingIndex = combinedData.findIndex(item => item.date === apiDataPoint.date);

                if (existingIndex !== -1) {
                    // 既存のデータがあれば、価格を上書き（予測データは保持）
                    const existingItem = combinedData[existingIndex];
                    combinedData[existingIndex] = {
                        ...existingItem,
                        price: apiDataPoint.price,
                    };
                } else {
                    // 既存のデータがなければ新規データを追加
                    // 理論値も計算して追加
                    const days = calculateDaysSinceGenesis(apiDataPoint.date);
                    const medianModel = calculateMedianPrice(days);
                    const supportModel = calculateSupportPrice(days);

                    combinedData.push({
                        ...apiDataPoint,
                        medianModel: medianModel,
                        supportModel: supportModel,
                    });
                }
            });
        }
        combinedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return combinedData;

    };


    const processChartData = (rawData) => {
        // データをチャート用に加工するロジック
        if (!rawData || rawData.length === 0) {
            return [];
        }

        const chartData = rawData.map((item) => {
            const days = calculateDaysSinceGenesis(item.date);

            // price, medianModel, supportModel が undefined または NaN の場合に備えて処理
            const price = typeof item.price === 'number' && !isNaN(item.price) ? log10(item.price) : undefined;
            const medianModel = typeof item.medianModel === 'number' && !isNaN(item.medianModel) ? log10(item.medianModel) : undefined;
            const supportModel = typeof item.supportModel === 'number' && !isNaN(item.supportModel) ? log10(item.supportModel) : undefined;

            return {
                date: item.date,
                days: days,
                price: price,
                medianModel: medianModel,
                supportModel: supportModel,
            };
        });
        return chartData;
    };


    const interpolateAndForecastToDaily = (weeklyData) => {
        // 日次データに補間・予測するロジック（これはカスタムフック内に移動）
        const interpolated = [];
        const startDate = new Date(Math.max(new Date('2010-07-01'), GENESIS_DATE));
        let currentDate = new Date(startDate);

        // 2010-07-18のデータ (weeklyPrices.jsonの最初のデータ)
        const initialPrice = weeklyData.length > 0 ? parseFloat(weeklyData[0].price) : null;

        // 2010-07-01 から 2010-07-17 までのデータ (初期値を埋める)
        while (currentDate < weeklyData[0].date) {
            const dateStr = toISODate(currentDate);
            const days = calculateDaysSinceGenesis(dateStr);
            const medianModel = calculateMedianPrice(days);
            const supportModel = calculateSupportPrice(days);
            interpolated.push({
                date: dateStr,
                price: initialPrice, // 初期値
                medianModel: medianModel,
                supportModel: supportModel,
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }


        // 週次データを基に日次データを補間
        let weeklyIndex = 0;
        while (weeklyIndex < weeklyData.length && currentDate <= FORECAST_END_DATE) {
            const nextWeeklyDate = weeklyIndex + 1 < weeklyData.length ? new Date(weeklyData[weeklyIndex + 1].date) : null;

            while (currentDate <= FORECAST_END_DATE && (nextWeeklyDate === null || currentDate < nextWeeklyDate)) {
                const dateStr = toISODate(currentDate);
                const days = calculateDaysSinceGenesis(dateStr);
                const medianModel = calculateMedianPrice(days);
                const supportModel = calculateSupportPrice(days);

                // 現在の日付が週次データの日付と一致する場合、その価格を使用
                const weeklyPrice = weeklyData[weeklyIndex] && currentDate.getTime() === new Date(weeklyData[weeklyIndex].date).getTime()
                    ? parseFloat(weeklyData[weeklyIndex].price)
                    : undefined;

                interpolated.push({
                    date: dateStr,
                    price: weeklyPrice,
                    medianModel: medianModel,
                    supportModel: supportModel,
                });

                currentDate.setDate(currentDate.getDate() + 1);
            }
            weeklyIndex++;
        }
        return interpolated;

    };

    const calculatePreviousPrice = useCallback(async (exchangeRate) => {

        const yesterday = subDays(new Date(), 1);
        const yesterdayISO = format(yesterday, 'yyyy-MM-dd');

        try {
            // Binance APIからの取得を試みる (カットオフ日付以降のデータの場合)
            if (yesterdayISO >= BINANCE_API_CUTOFF_DATE) {
                console.log('Binance APIから前日価格を取得します');
                const startTime = new Date(yesterdayISO).getTime();
                const endTime = new Date(yesterday).setHours(23, 59, 59, 999); // その日の終わり

                const response = await fetch(
                    `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&startTime=${startTime}&endTime=${endTime}`
                );

                if (response.ok) {
                    const binanceData = await response.json();
                    if (binanceData && binanceData.length > 0) {
                        // Binanceデータの[4]はその日の終値
                        const previousPriceUSD = parseFloat(binanceData[0][4]);
                        const previousJpyPrice = previousPriceUSD * exchangeRate;
                        const dataToCache = { usd: previousPriceUSD, jpy: previousJpyPrice };

                        return dataToCache;
                    }
                }
                console.warn('Binance APIからのデータ取得に失敗しました、weeklyPrices.jsonにフォールバックします');
            }

            // weeklyPrices.jsonから前日の価格を取得（Binance API取得失敗時またはカットオフ日付より前のデータ）
            const response = await fetch('./weeklyPrices.json');
            if (!response.ok) {
                console.error("Failed to fetch weekly prices:", response.status, response.statusText);
                throw new Error("週次価格データの取得に失敗しました");
            }

            const weeklyPrices = await response.json();
            const closestPastPriceEntry = weeklyPrices
                .filter(entry => entry.date <= yesterdayISO)  // 過去のデータに限定
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]; // 日付で降順ソートし、最初の要素を取得

            if (closestPastPriceEntry) {
                const previousPriceUSD = parseFloat(closestPastPriceEntry.price);
                const previousJpyPrice = previousPriceUSD * exchangeRate;
                const dataToCache = { usd: previousPriceUSD, jpy: previousJpyPrice };

                return dataToCache;
            } else {
                throw new Error('前日のデータが見つかりません');
            }
        } catch (error) {
            console.warn('前日価格の取得に失敗:', error.message);
            // 適切なデータがない場合の代替処理（フォールバック）
            const fallbackPriceUSD = Math.pow(10, -17.01593313 + 5.84509376 * Math.log10(calculateDaysSinceGenesis(yesterdayISO))); // パワーローで計算
            const fallbackPriceJPY = fallbackPriceUSD * exchangeRate;
            const fallbackPrice = {
                usd: fallbackPriceUSD,
                jpy: fallbackPriceJPY
            };

            return fallbackPrice;
        }

    }, [exchangeRate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return chartData;
};

export default useBitcoinChartData;