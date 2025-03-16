import React from 'react';
import PowerLawChart from './PowerLawChart';

// 型定義を直接埋め込む
interface PowerLawChartProps {
    rSquared?: number | null;
    chartData: Array<{ date: number; price: number | null; medianModel: number; supportModel: number; isFuture: boolean; daysSinceGenesis: number }>;
    exchangeRate: number;
    currentPrice: number;
    height?: number;
    isZoomed?: boolean;
    powerLawPosition?: number | null;
}

interface PowerLawChartWrapperProps extends PowerLawChartProps {
    chartTitle?: string;
}

const PowerLawChartWrapper: React.FC<PowerLawChartWrapperProps> = ({
    rSquared,
    chartData,
    exchangeRate,
    currentPrice,
    height,
    isZoomed,
    powerLawPosition,
    chartTitle = 'パワーロー価格予測',
}) => {
    return (
        <div>
            <h3 className="text-center text-lg font-medium text-amber-400 mb-2">{chartTitle}</h3>
            <PowerLawChart
                rSquared={rSquared}
                chartData={chartData}
                exchangeRate={exchangeRate}
                currentPrice={currentPrice}
                height={height}
                isZoomed={isZoomed}
                powerLawPosition={powerLawPosition}
            />
        </div>
    );
};

export default PowerLawChartWrapper;

