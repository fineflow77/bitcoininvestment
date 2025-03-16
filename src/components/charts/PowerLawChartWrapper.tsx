import React from 'react';
import PowerLawChart from './PowerLawChart';

// 型定義を直接埋め込み
interface PowerLawChartProps {
    rSquared?: number | null;
    chartData: Array<{
        date: number;
        price: number | null;
        medianModel: number;
        supportModel: number;
        isFuture: boolean;
        daysSinceGenesis: number;
    }>;
    exchangeRate: number;
    currentPrice: number;
    height?: number;
    isZoomed?: boolean;
    powerLawPosition?: number | null;
}

const LogLogPowerLawChart: React.FC<PowerLawChartProps> = ({
    rSquared,
    chartData,
    exchangeRate,
    currentPrice,
    height,
    isZoomed,
    powerLawPosition,
}) => {
    return (
        <PowerLawChart
            rSquared={rSquared}
            chartData={chartData}
            exchangeRate={exchangeRate}
            currentPrice={currentPrice}
            height={height}
            isZoomed={isZoomed}
            powerLawPosition={powerLawPosition}
            xAxisScale="log"
            yAxisScale="log"
        />
    );
};

export default LogLogPowerLawChart;