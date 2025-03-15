import React from 'react';
import PowerLawChart from './PowerLawChart';
import { PowerLawChartProps } from '../../types';

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