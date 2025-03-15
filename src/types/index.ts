export type PriceModelType = 'standard' | 'conservative';

export interface ChartDataPoint {
    date: number;
    price: number | null;
    medianModel: number;
    supportModel: number;
    daysSinceGenesis: number;
    isFuture?: boolean;
}

export interface PowerLawChartProps {
    rSquared: number;
    chartData: ChartDataPoint[];
    exchangeRate: number;
    currentPrice?: number;
    height: number;
    showPositionInfo?: boolean;
    isZoomed?: boolean;
    powerLawPosition?: number | null;
    xAxisScale?: 'linear' | 'log';
    yAxisScale?: 'linear' | 'log';
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
    // dataSources?: { currentPrice?: string }; // 将来用にコメントアウト
}

export interface PriceResponse {
    prices: {
        usd: number;
        jpy: number;
    };
    timestamp: string;
}