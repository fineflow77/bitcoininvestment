import React from 'react';
import PowerLawChart from './PowerLawChart';
import LogLogPowerLawChart from './LogLogPowerLawChart';

interface PowerLawChartWrapperProps extends PowerLawChartProps {
}

const PowerLawChartWrapper: React.FC<PowerLawChartWrapperProps> = (props) => {
    return (
        <div>
            <div>

                <PowerLawChart
                    {...props}
                    height={400}
                    showRSquared={false}
                    chartTitle="Y軸対数グラフ"
                />
            </div>
            <div className="mt-8">

                <LogLogPowerLawChart
                    {...props}
                    height={400}
                    showRSquared={true}
                    chartTitle="ログログチャート"
                />
            </div>
        </div>
    );
};

export default PowerLawChartWrapper;