import { useState, useEffect, useCallback } from 'react';
import { PriceModel, CHART_TIME_RANGE, TIME_INTERVALS } from '../utils/constants';
import { calculateRSquared } from '../utils/models';

// 型定義を直接埋め込む
interface ChartDataPoint {
    date: number;
    price: number | null;
    medianModel: number;
    supportModel: number;
    isFuture: boolean;
    daysSinceGenesis: number;
}

interface PriceResponse {
    prices: { usd: number; jpy: number };
    timestamp: string;
    source: string;
}

const getDaysSinceGenesis = (date: Date): number => {
    const genesisDate = new Date('2009-01-03');
    return Math.floor((date.getTime() - genesisDate.getTime()) / TIME_INTERVALS.DAY_MS);
};

const btcPriceMedian = (days: number, model: PriceModel = PriceModel.STANDARD): number => {
    const price = Math.pow(10, -17.01593313 + 5.84509376 * Math.log10(days));
    console.log(`btcPriceMedian: Days=${days}, Model=${model}, Price=${price.toFixed(2)}`);
    return price;
};

const btcPriceSupport = (days: number): number => {
    const logPrice = -17.668 + 5.926 * Math.log10(days);
    const price = Math.pow(10, logPrice);
    console.log(`btcPriceSupport: Days=${days}, Support=${price.toFixed(2)}`);
    return price;
};

const fetchBinanceCurrentPrice = async (): Promise<PriceResponse> => {
    try {
        const [usdcResponse, jpyResponse] = await Promise.all([
            fetch('/api/binance/api/v3/ticker/price?symbol=BTCUSDT'),
            fetch('/api/binance/api/v3/ticker/price?symbol=BTCJPY'),
        ]);
        if (!usdcResponse.ok) throw new Error(`Binance USDT HTTP error! status: ${usdcResponse.status}`);
        if (!jpyResponse.ok) throw new Error(`Binance JPY HTTP error! status: ${jpyResponse.status}`);
        const usdcData = await usdcResponse.json();
        const jpyData = await jpyResponse.json();
        const usdPrice = parseFloat(usdcData.price);
        const jpyPrice = parseFloat(jpyData.price);
        console.log(`Binance Current: USD=${usdPrice}, JPY=${jpyPrice}`);
        return {
            prices: { usd: usdPrice, jpy: jpyPrice },
            timestamp: new Date().toISOString(),
            source: 'binance',
        };
    } catch (error) {
        console.error('Binance Current Price Fetch Error:', error);
        throw error;
    }
};

const fetchBinanceDailyPrices = async (): Promise<Array<{ date: string; price: number }>> => {
    try {
        const response = await fetch('/api/binance/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=365');
        if (!response.ok) throw new Error(`Binance HTTP error! status: ${response.status}`);
        const data = await response.json();
        const prices = data.map(([timestamp, open]: [number, string]) => ({
            date: new Date(timestamp).toISOString().split('T')[0],
            price: parseFloat(open),
        }));
        console.log(`Binance Daily Prices: ${prices.length} entries`);
        return prices;
    } catch (error) {
        console.error('Binance Daily Prices Fetch Error:', error);
        throw error;
    }
};

const fetchCoinGeckoCurrentPrice = async (): Promise<PriceResponse> => {
    try {
        const response = await fetch('/api/coingecko/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,jpy');
        if (!response.ok) throw new Error(`CoinGecko HTTP error! status: ${response.status}`);
        const data = await response.json();
        const usdPrice = data.bitcoin.usd;
        const jpyPrice = data.bitcoin.jpy;
        console.log(`CoinGecko Current: USD=${usdPrice}, JPY=${jpyPrice}`);
        return {
            prices: { usd: usdPrice, jpy: jpyPrice },
            timestamp: new Date().toISOString(),
            source: 'coingecko',
        };
    } catch (error) {
        console.error('CoinGecko Current Price Fetch Error:', error);
        throw error;
    }
};

const fetchCoinGeckoDailyPrices = async (): Promise<Array<{ date: string; price: number }>> => {
    try {
        const response = await fetch('/api/coingecko/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily');
        if (!response.ok) throw new Error(`CoinGecko HTTP error! status: ${response.status}`);
        const data = await response.json();
        const prices = data.prices.map(([timestamp, price]: [number, number]) => ({
            date: new Date(timestamp).toISOString().split('T')[0],
            price,
        }));
        console.log(`CoinGecko Daily Prices: ${prices.length} entries`);
        return prices;
    } catch (error) {
        console.error('CoinGecko Daily Prices Fetch Error:', error);
        throw error;
    }
};

const fetchWeeklyJson = async (): Promise<Array<{ date: string; powerLawPosition: number; price: number }>> => {
    try {
        const response = await fetch('/weekly.json');
        if (!response.ok) throw new Error(`Weekly JSON HTTP error! status: ${response.status}`);
        const weeklyData = await response.json();
        if (!Array.isArray(weeklyData)) throw new Error('weekly.json is not an array');
        const filteredData = weeklyData
            .filter(item => item.date && typeof item.price === 'number')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        console.log(`Weekly JSON: ${filteredData.length} entries`);
        return filteredData;
    } catch (error) {
        console.error('Weekly JSON Fetch Error:', error);
        return [
            { date: '2010-07-18', powerLawPosition: 0, price: 0.09 },
            { date: '2023-12-31', powerLawPosition: 0, price: 42000 },
        ];
    }
};

const generateChartData = (
    weeklyData: Array<{ date: string; powerLawPosition: number; price: number }>,
    dailyData: Array<{ date: string; price: number }>,
    currentPrice: PriceResponse | null
) => {
    const now = new Date();
    const nowTimestamp = now.getTime();
    const startTimestamp = CHART_TIME_RANGE.DISPLAY_START_DATE.getTime();
    const chartEndTimestamp = new Date('2040-12-31').getTime();
    const cutoffTimestamp = new Date('2023-12-31').getTime();

    const allData: ChartDataPoint[] = [];
    const dataMap = new Map<number, ChartDataPoint>();

    weeklyData.forEach(item => {
        const date = new Date(item.date);
        const timestamp = date.getTime();
        const days = getDaysSinceGenesis(date);
        if (timestamp >= startTimestamp && timestamp <= cutoffTimestamp) {
            const median = btcPriceMedian(days);
            const support = btcPriceSupport(days);
            dataMap.set(days, {
                date: timestamp,
                price: item.price,
                medianModel: median,
                supportModel: support,
                isFuture: timestamp > nowTimestamp,
                daysSinceGenesis: days,
            });
        }
    });

    dailyData.forEach(item => {
        const date = new Date(item.date);
        const timestamp = date.getTime();
        const days = getDaysSinceGenesis(date);
        if (timestamp > cutoffTimestamp && timestamp <= nowTimestamp) {
            const median = btcPriceMedian(days);
            const support = btcPriceSupport(days);
            dataMap.set(days, {
                date: timestamp,
                price: item.price,
                medianModel: median,
                supportModel: support,
                isFuture: false,
                daysSinceGenesis: days,
            });
        }
    });

    let todayPowerLawPrice: { median: number; support: number } | undefined;
    if (currentPrice) {
        const days = getDaysSinceGenesis(now);
        const median = btcPriceMedian(days);
        const support = btcPriceSupport(days);
        const existingPoint = dataMap.get(days);
        if (existingPoint) {
            existingPoint.price = currentPrice.prices.usd;
            existingPoint.medianModel = median;
            existingPoint.supportModel = support;
        } else {
            dataMap.set(days, {
                date: nowTimestamp,
                price: currentPrice.prices.usd,
                medianModel: median,
                supportModel: support,
                isFuture: false,
                daysSinceGenesis: days,
            });
        }
        todayPowerLawPrice = { median, support };
    }

    const dayMs = TIME_INTERVALS.DAY_MS;
    const startDays = getDaysSinceGenesis(CHART_TIME_RANGE.DISPLAY_START_DATE);
    const simEndDays = getDaysSinceGenesis(new Date('2050-12-31'));
    for (let days = startDays; days <= simEndDays; days += 7) {
        const timestamp = CHART_TIME_RANGE.START_DATE.getTime() + days * dayMs;
        if (!dataMap.has(days)) {
            const median = btcPriceMedian(days);
            const support = btcPriceSupport(days);
            dataMap.set(days, {
                date: timestamp,
                price: null,
                medianModel: median,
                supportModel: support,
                isFuture: timestamp > nowTimestamp,
                daysSinceGenesis: days,
            });
        }
    }

    allData.push(...Array.from(dataMap.values()).sort((a, b) => a.daysSinceGenesis - b.daysSinceGenesis));
    const linearLogData = allData.filter(d => d.date <= chartEndTimestamp);
    const logLogData = allData.filter(d => d.date <= chartEndTimestamp);

    const rSquaredInput: [number, number][] = linearLogData
        .filter(d => !d.isFuture && d.price !== null)
        .map(d => [Math.log(d.daysSinceGenesis), Math.log(d.price as number)] as [number, number]);
    const rSquared = calculateRSquared(rSquaredInput);

    return { linearLogData, logLogData, rSquared, todayPowerLawPrice };
};

interface BitcoinData {
    loading: boolean;
    error: Error | null;
    currentPrice: PriceResponse | null;
    dailyPrices: Array<{ date: string; price: number }>;
    weeklyPrices: Array<{ date: string; powerLawPosition: number; price: number }>;
    linearLogData: ChartDataPoint[];
    logLogData: ChartDataPoint[];
    exchangeRate: number;
    rSquared: number | null;
    dataSources: { currentPrice?: string; dailyPrices?: string; weeklyPrices?: string };
    todayPowerLawPrice?: { median: number; support: number };
}

export const useBitcoinData = (): BitcoinData => {
    const [state, setState] = useState<BitcoinData>({
        loading: true,
        error: null,
        currentPrice: null,
        dailyPrices: [],
        weeklyPrices: [],
        linearLogData: [],
        logLogData: [],
        exchangeRate: 150.0,
        rSquared: null,
        dataSources: {},
        todayPowerLawPrice: undefined,
    });

    const fetchData = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const weeklyPricesData = await fetchWeeklyJson();
            let currentPriceData: PriceResponse;
            let dailyPricesData: Array<{ date: string; price: number }>;

            try {
                [currentPriceData, dailyPricesData] = await Promise.all([
                    fetchBinanceCurrentPrice(),
                    fetchBinanceDailyPrices(),
                ]);
            } catch (binanceError) {
                console.warn('Binance失敗、CoinGeckoにフォールバック:', binanceError);
                [currentPriceData, dailyPricesData] = await Promise.all([
                    fetchCoinGeckoCurrentPrice(),
                    fetchCoinGeckoDailyPrices(),
                ]);
            }

            const { linearLogData, logLogData, rSquared, todayPowerLawPrice } = generateChartData(weeklyPricesData, dailyPricesData, currentPriceData);

            setState({
                loading: false,
                error: null,
                currentPrice: currentPriceData,
                dailyPrices: dailyPricesData,
                weeklyPrices: weeklyPricesData,
                linearLogData,
                logLogData,
                exchangeRate: currentPriceData.prices.jpy / currentPriceData.prices.usd,
                rSquared,
                dataSources: {
                    currentPrice: currentPriceData.source,
                    dailyPrices: currentPriceData.source,
                    weeklyPrices: 'local',
                },
                todayPowerLawPrice,
            });
        } catch (error) {
            console.error('全体エラー:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error : new Error(String(error)),
                linearLogData: [],
                logLogData: [],
                rSquared: null,
                todayPowerLawPrice: undefined,
            }));
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return state;
};