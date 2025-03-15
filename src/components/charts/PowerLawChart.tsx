import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import { getPowerLawPositionLabel, getPowerLawPositionColor, formatPercentage } from '../../utils/models';
import { PowerLawChartProps } from '../../types';

const COLORS = {
    price: '#8884d8',
    median: '#82ca9d',
    support: '#ff7300',
};

const PowerLawChart: React.FC<PowerLawChartProps> = ({
    rSquared,
    chartData,
    exchangeRate,
    currentPrice,
    height,
    powerLawPosition,
    xAxisScale = 'linear',
    yAxisScale = 'linear',
}) => {
    const formatXAxis = (days: number) => {
        const date = new Date(days * 86400000);
        return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' });
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                syncId="anyId"
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="daysSinceGenesis"
                    type="number"
                    scale={xAxisScale}
                    tickLine={false}
                    axisLine
                    tickFormatter={formatXAxis}
                    tick={{ fontSize: 12, fill: '#666', fontWeight: 'normal' }}
                    ticks={[0, 1000, 2000, 3000, 4000, 5000]}
                    domain={[0, 5500]}
                    aria-label="日数軸"
                />
                <YAxis
                    type="number"
                    scale={yAxisScale}
                    domain={['auto', 'auto']}
                    tickFormatter={(value: number) => formatPercentage(value / exchangeRate, 0)}
                    tick={{ fontSize: 12, fill: '#666', fontWeight: 'normal' }}
                    orientation="left"
                    aria-label="価格軸"
                />
                <Tooltip
                    formatter={(value: number) => formatPercentage(value / exchangeRate, 0)}
                    labelFormatter={(label: number) => `日数: ${label}`}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="price"
                    stroke={COLORS.price}
                    dot={false}
                    activeDot={{ r: 5, fill: COLORS.price, strokeWidth: 1, stroke: '#fff' }}
                    name="価格"
                />
                <Line
                    type="monotone"
                    dataKey="medianModel"
                    stroke={COLORS.median}
                    dot={false}
                    name="中央モデル"
                />
                <Line
                    type="monotone"
                    dataKey="supportModel"
                    stroke={COLORS.support}
                    dot={false}
                    name="下限モデル"
                />
                <ReferenceLine
                    y={currentPrice ?? 0}
                    stroke="#fff"
                    strokeDasharray="3 3"
                    strokeWidth={2}
                    yAxisId={0}
                />
                {powerLawPosition !== null && powerLawPosition !== undefined && (
                    <text
                        x={chartData[chartData.length - 1].daysSinceGenesis}
                        y={currentPrice ?? 0}
                        dy={-10}
                        fill="#fff"
                        fontSize={12}
                        textAnchor="middle"
                    >
                        パワーロー位置:{' '}
                        <tspan style={{ color: getPowerLawPositionColor(powerLawPosition), fontWeight: 'bold' }}>
                            {formatPercentage(powerLawPosition)}
                        </tspan>{' '}
                        (<tspan>{getPowerLawPositionLabel(powerLawPosition)}</tspan>)
                    </text>
                )}
                <text x={50} y={30} fill="#fff" fontSize={14} fontWeight="bold">
                    R²: {rSquared.toFixed(4)}
                </text>
            </LineChart>
        </ResponsiveContainer>
    );
};

export default PowerLawChart;
export type { PowerLawChartProps };