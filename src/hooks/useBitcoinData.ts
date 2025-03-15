import { useState, useEffect } from 'react';
import { ChartDataPoint, BitcoinData, PriceResponse } from '../types';

const fetchCurrentPrice = async (): Promise<PriceResponse> => {
    const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice/JPY.json');
    const data = await response.json();
    const usdPrice = data.bpi.USD.rate_float;
    const jpyPrice = data.bpi.JPY.rate_float;
    return {
        prices: { usd: usdPrice, jpy: jpyPrice },
        timestamp: new Date().toISOString(),
    };
};

const fetchDailyPrices = async (): Promise<{ date: string; price: number }[]> => {
    const response = await fetch('https://api.coindesk.com/v1/bpi/historical/close.json?currency=JPY');
    const data = await response.json();
    return Object.entries(data.bpi).map(([date, price]) => ({
        date,
        price: price as number,
    }));
};

const fetchWeeklyPrices = async (): Promise<{ date: string; price: number }[]> => {
    const response = await fetch('https://api.coindesk.com/v1/bpi/historical/close.json?currency=JPY&for=yesterday&index=weekly');
    const data = await response.json();
    return Object.entries(data.bpi).map(([date, price]) => ({
        date,
        price: price as number,
    }));
};

const generatePowerLawData = (dailyPrices: { date: string; price: number }[], exchangeRate: number): ChartDataPoint[] => {
    const powerLawData: ChartDataPoint[] = [];
    const genesisDate = new Date('2009-01-03');
    const today = new Date();

    for (let date = genesisDate; date <= today; date.setDate(date.getDate() + 1)) {
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