export interface ChartDataPoint {
    date: number;
    price: number | null;
    medianModel: number;
    supportModel: number;
    isFuture: boolean;
    daysSinceGenesis: number;
}

export interface BitcoinData {
    prices: {
        usd: number;
        jpy: number;
    };
    timestamp: string;
}

export interface PowerLawChartProps {
    rSquared: number;
    chartData: ChartDataPoint[];
    exchangeRate: number;
    currentPrice: number | null | undefined; // null や undefined を許容
    height: number;
    isZoomed: boolean;
    powerLawPosition: number | null;
}

export interface DataContainerProps {
    children: React.ReactNode;
    isLoading: boolean;
    error: Error | null;
    loadingMessage: string;
    noDataMessage?: string; // オプション
}

export type PriceModelType = 'STANDARD' | 'ALTERNATIVE' | 'conservative' | 'standard'; // 拡張