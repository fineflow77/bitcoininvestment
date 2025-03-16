// src/types/index.ts
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

export interface PowerLawChartProps {
    exchangeRate?: number;
    rSquared: number | null;
    chartData: ChartDataPoint[];
    currentPrice?: number;
    height?: number;
    showPositionInfo?: boolean;
    isZoomed?: boolean;
    powerLawPosition?: number | null;
    xAxisScale?: 'linear' | 'log';
    yAxisScale?: 'linear' | 'log';
    showRSquared?: boolean;
    chartTitle?: string;
}

export interface TooltipContentProps {
    active?: boolean;
    payload?: any[];
    label?: number;
    exchangeRate: number;
    currentPrice?: number;
    powerLawPosition?: number | null;
}

export interface ZoomState {
    start: number;
    end: number;
    originalDomain: [number, number];
    isZooming: boolean;
    refAreaLeft: number | null;
    refAreaRight: number | null;
}