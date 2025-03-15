import { useState, useEffect } from 'react';
import { ChartDataPoint, BitcoinData, PriceResponse } from '../types';

const fetchBinancePrice = async (): Promise<PriceResponse> => {
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        if (!response.ok) throw new Error(`Binance HTTP error! status: ${response.status}`);
        const data = await response.json();
        const usdPrice = parseFloat(data.price);
        const jpyResponse = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCJPY');
        if (!jpyResponse.ok) throw new Error(`Binance JPY HTTP error! status: ${jpyResponse.status}`);
        const jpyData = await jpyResponse.json();
        const jpyPrice = parseFloat(jpyData.price);
        return {
            prices: { usd: usdPrice, jpy: jpyPrice },
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error('Failed to fetch from Binance:', error);
        throw error;
    }
};

const fetchCoinGeckoPrice = async (): Promise<PriceResponse> => {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,jpy');
        if (!response.ok) throw new Error(`CoinGecko HTTP error! status: ${response.status}`);
        const data = await response.json();
        return {
            prices: { usd: data.bitcoin.usd, jpy: data.bitcoin.jpy },
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error('Failed to fetch from CoinGecko:', error);
        throw error;
    }
};

const fetchCurrentPrice = async (): Promise<PriceResponse> => {
    try {
        return await fetchBinancePrice(); // Binance を優先
    } catch (binanceError) {
        console.warn('Binance failed, falling back to CoinGecko');
        return await fetchCoinGeckoPrice(); // 失敗時に CoinGecko
    }
};

const fetchDailyPrices = async (): Promise<{ date: string; price: number }[]> => {
    try {
        const response = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCJPY&interval=1d&limit=30');
        if (!response.ok) throw new Error(`Binance HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.map((entry: any) => ({
            date: new Date(entry[0]).toISOString().split('T')[0],
            price: parseFloat(entry[4]), // 終値
        }));
    } catch (error) {
        console.error('Failed to fetch Binance daily prices:', error);
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=jpy&days=30');
            if (!response.ok) throw new Error(`CoinGecko HTTP error! status: ${response.status}`);
            const data = await response.json();
            return data.prices.map(([timestamp, price]: [number, number]) => ({
                date: new Date(timestamp).toISOString().split('T')[0],
                price,
            }));
        } catch (fallbackError) {
            console.error('Failed to fetch CoinGecko daily prices:', fallbackError);
            return [];
        }
    }
};

const fetchWeeklyPrices = async (): Promise<{ date: string; price: number }[]> => {
    try {
        const response = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCJPY&interval=1w&limit=30');
        if (!response.ok) throw new Error(`Binance HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.map((entry: any) => ({
            date: new Date(entry[0]).toISOString().split('T')[0],
            price: parseFloat(entry[4]), // 終値
        }));
    } catch (error) {
        console.error('Failed to fetch Binance weekly prices:', error);
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=jpy&days=210'); // 30週 ≈ 210日
            if (!response.ok) throw new Error(`CoinGecko HTTP error! status: ${response.status}`);
            const data = await response.json();
            return data.prices
                .filter((_: any, i: number) => i % 7 === 0) // 週次に近似
                .map(([timestamp, price]: [number, number]) => ({
                    date: new Date(timestamp).toISOString().split('T')[0],
                    price,
                }));
        } catch (fallbackError) {
            console.error('Failed to fetch CoinGecko weekly prices:', fallbackError);
            return [];
        }
    }
};

const generatePowerLawData = (dailyPrices: { date: string; price: number }[], exchangeRate: number): ChartDataPoint[] => {
    const powerLawData: ChartDataPoint[] = [];
    const genesisDate = new Date('2009-01-03');
    const today = new Date();

    for (let date = new Date(genesisDate); date <= today; date.setDate(date.getDate() + 1)) {
        const daysSinceGenesis = Math.floor((date.getTime() - genesisDate.getTime()) / (1000 * 60 * 60 * 24));
        const priceEntry = dailyPrices.find((entry) => new Date(entry.date).toDateString() === date.toDateString());
        const price = priceEntry ? priceEntry.price / exchangeRate : null;

        powerLawData.push({
            date: date.getTime(),
            daysSinceGenesis,
            price,
            medianModel: Math.pow(10, -17.01593313 + 5.84509376 * Math.log10(daysSinceGenesis)),
            supportModel: Math.pow(10, -17.5 + 5.5 * Math.log10(daysSinceGenesis)),
        });
    }

    return powerLawData;
};

export const useBitcoinData = () => {
    const [state, setState] = useState<BitcoinData>({
        loading: false,
        error: null,
        currentPrice: null,
        exchangeRate: 150,
        weeklyPrices: [],
        powerLawData: [],
        dailyPrices: [],
        dailyPowerLawData: [],
        rSquared: null,
    });

    useEffect(() => {
        const fetchData = async () => {
            setState((prevState) => ({ ...prevState, loading: true, error: null }));

            try {
                const currentPriceData = await fetchCurrentPrice();
                const dailyPricesData = await fetchDailyPrices();
                const weeklyPricesData = await fetchWeeklyPrices();

                const exchangeRate = currentPriceData.prices.jpy / currentPriceData.prices.usd;
                const powerLawData = generatePowerLawData(dailyPricesData, exchangeRate);

                const rSquared = calculateRSquared(
                    weeklyPricesData.map((item) => [new Date(item.date).getTime(), item.price] as [number, number])
                );

                setState({
                    loading: false,
                    error: null,
                    currentPrice: currentPriceData,
                    exchangeRate,
                    weeklyPrices: weeklyPricesData,
                    powerLawData,
                    dailyPrices: dailyPricesData,
                    dailyPowerLawData: powerLawData,
                    rSquared,
                });
            } catch (error) {
                setState((prevState) => ({
                    ...prevState,
                    loading: false,
                    error: error instanceof Error ? error : new Error('データ取得に失敗しました'),
                }));
            }
        };

        fetchData();
    }, []);

    return state;
};

const calculateRSquared = (data: [number, number][]): number | null => {
    if (!data || data.length === 0) return null;

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;
    const n = data.length;

    for (let i = 0; i < n; i++) {
        const [x, y] = data[i];
        sumX += Math.log10(x);
        sumY += Math.log10(y);
        sumXY += Math.log10(x) * Math.log10(y);
        sumX2 += Math.log10(x) * Math.log10(x);
        sumY2 += Math.log10(y) * Math.log10(y);
    }

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    return denominator === 0 ? null : Math.pow(numerator / denominator, 2);
};