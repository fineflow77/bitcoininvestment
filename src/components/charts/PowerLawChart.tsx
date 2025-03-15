import React, { useMemo, useState, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import { calculatePowerLawPosition, getPowerLawPositionLabel, getPowerLawPositionColor, formatPercentage } from '../../utils/models';
import { ChartDataPoint } from '../../types'; // 型インポート

const COLORS = {
    price: '#8884d8',
    median: '#82ca9d',
    support: '#ff7300',
};

const CHART_CONFIG = {
    ANIMATION_DURATION: 300,
};

interface PowerLawChartProps {
    rSquared: number;
    chartData: ChartDataPoint[];
    exchangeRate: number;
    currentPrice: number | null | undefined;
    height: number;
    isZoomed: boolean;
    powerLawPosition: number | null;
}

const PowerLawChart: React.FC<PowerLawChartProps> = ({
    rSquared,
    chartData,
    exchangeRate,
    currentPrice,
    height,
    isZoomed,
    powerLawPosition,
}) => {
    const chartRef = useRef<SVGSVGElement>(null);

    const formatXAxis = (days: any) => {
        const date = new Date(days * 86400000); // 日数をミリ秒に変換
        return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' });
    };

    const renderCustomizedLabel = (props: any) => {
        const { x, y, value } = props;
        return (
            <text x={x} y={y} dy={-4} fill="#fff" fontSize={12} textAnchor="middle">
                {formatPercentage(value / exchangeRate, 0)}
            </text>
        );
    };

    const pointPosition = useMemo(() => {
        if (!currentPrice || !chartData.length) return null;
        const data = chartData[chartData.length - 1]; // 最新データ
        return calculatePowerLawPosition(currentPrice, data.medianModel); // supportModel を削除
    }, [currentPrice, chartData]);

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
                    domain={['auto', 'auto']}
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
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => formatPercentage(value / exchangeRate, 0)}
                    tick={{ fontSize: 12, fill: '#666', fontWeight: 'normal' }}
                    orientation="left"
                    aria-label="価格軸"
                />
                <Tooltip
                    formatter={(value: number) => formatPercentage(value / exchangeRate, 0)}
                    labelFormatter={(label) => `日数: ${label}`}
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
                    yAxisId="left"
                />
                {pointPosition !== null && (
                    <text
                        x={chartData[chartData.length - 1].daysSinceGenesis}
                        y={currentPrice ?? 0}
                        dy={-10}
                        fill="#fff"
                        fontSize={12}
                        textAnchor="middle"
                    >
                        パワーロー位置: <span style={{ color: getPowerLawPositionColor(pointPosition), fontWeight: 'bold' }}>{formatPercentage(pointPosition)}</span>{' '}
                        (<span>{getPowerLawPositionLabel(pointPosition)}</span>)
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
export { PowerLawChartProps }; // 型をエクスポート