export type PriceModelType = 'standard' | 'conservative';

export interface ChartDataPoint {
    date: number;
    price: number | null;
    medianModel: number;
    supportModel: number;
    daysSinceGenesis: number;
    isFuture?: boolean;
}

export interface BitcoinData {
    loading: boolean;
    error: Error | null;
    currentPrice: PriceResponse | null;
    exchangeRate: number;
    weeklyPrices: { date: string; price: number }[];
    powerLawData: ChartDataPoint[];
    dailyPrices: { date: string; price: number }[];
    dailyPowerLawData: ChartDataPoint[];
    rSquared: number | null;
    dataSources?: { currentPrice?: string; dailyPrices?: string; weeklyPrices?: string; };
}

export interface PriceResponse {
    prices: {
        usd: number;
        jpy: number;
    };
    timestamp: string;
    source?: string;
}