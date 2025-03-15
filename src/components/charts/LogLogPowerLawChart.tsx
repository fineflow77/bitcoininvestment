import React from 'react';
import PowerLawChart, { PowerLawChartProps } from './PowerLawChart';

interface LogLogPowerLawChartProps extends PowerLawChartProps { }

const LogLogPowerLawChart: React.FC<LogLogPowerLawChartProps> = (props) => {
    return (
        <PowerLawChart
            {...props}
            xAxisScale="log"
            yAxisScale="log" // yAxisScale を 'log' に設定 (下のチャート用)
            height={400}
        />
    );
};

export default LogLogPowerLawChart;