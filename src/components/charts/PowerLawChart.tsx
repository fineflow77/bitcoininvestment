import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea,
    Label,
    ReferenceLine,
    Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { HALVING_EVENTS } from '../../utils/constants';
import {
    formatPercentage,
    getPowerLawPositionLabel,
    calculatePowerLawPosition,
} from '../../utils/models';
import { getDaysSinceGenesis } from '../../utils/dateUtils';

interface ChartDataPoint {
    date: number;
    price: number | null;
    medianModel: number;
    supportModel: number;
    resistanceModel?: number;
    isFuture: boolean;
    daysSinceGenesis: number;
}

interface PowerLawChartProps {
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

interface TooltipContentProps {
    active?: boolean;
    payload?: any[];
    label?: number;
    exchangeRate: number;
    currentPrice?: number;
    powerLawPosition?: number | null;
}

const COLORS = {
    price: '#FF9500',
    median: '#4CAF50',
    support: '#E57373',
    grid: '#5A5A6A',
    halving: 'rgba(255, 255, 255, 0.25)',
    tooltip: { bg: 'rgba(26, 32, 44, 0.95)', border: 'rgba(82, 82, 91, 0.8)' },
    infoBg: 'rgba(26, 32, 44, 0.75)',
    introBg: 'rgba(0, 0, 0, 0.5)',
    chartBg: 'transparent',
    plotAreaBg: '#000000', // プロットエリアを黒に
    legendText: '#e2e8f0',
    priceArea: 'rgba(255, 149, 0, 0.1)',
    supportArea: 'rgba(229, 115, 115, 0.1)',
};

const CHART_CONFIG = {
    ANIMATION_DURATION: 300,
    PRICE_LINE_WIDTH: 1.5,
    MODEL_LINE_WIDTH: 2,
    REFERENCE_LINE_WIDTH: 2,
    MARGIN: { top: 80, right: 50, left: 70, bottom: 30 },
};

const getPowerLawPositionColorSoft = (position: number | null | undefined): string => {
    if (position === null || position === undefined) return '#888888';
    if (position < -50) return '#64B5F6';
    if (position < -30) return '#90CAF9';
    if (position < -10) return '#81C784';
    if (position <= 10) return '#AED581';
    if (position <= 30) return '#FFB74D';
    if (position <= 70) return '#EF9A9A';
    return '#E57373';
};

const TooltipContent: React.FC<TooltipContentProps> = ({
    active,
    payload,
    label,
    exchangeRate,
    currentPrice,
    powerLawPosition,
}) => {
    if (!active || !payload || !payload.length || !label) return null;

    const data = payload[0].payload as ChartDataPoint;
    const date = new Date(label).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const priceUSD = data.price !== null ? data.price : (data.isFuture ? null : currentPrice);
    const priceJPY = priceUSD ? priceUSD * exchangeRate : null;
    const isCurrentData = !data.isFuture && data.price !== null;
    let pointPosition = null;

    if (isCurrentData && priceUSD) {
        pointPosition = calculatePowerLawPosition(priceUSD, data.medianModel, data.supportModel);
    }
    const isCurrentTimePoint = Math.abs(new Date(label).getTime() - new Date().getTime()) < 24 * 60 * 60 * 1000;

    if (isCurrentTimePoint && powerLawPosition !== null) {
        pointPosition = powerLawPosition;
    }

    return (
        <div
            className="p-3 rounded-lg shadow-md"
            style={{ backgroundColor: COLORS.tooltip.bg, border: `1px solid ${COLORS.tooltip.border}`, color: '#fff', fontSize: '12px', opacity: 0.9 }}
        >
            <p className="font-semibold">{date}</p>
            {!data.isFuture && priceUSD && (
                <p>
                    実際価格: <span style={{ color: COLORS.price }}>{formatCurrency(priceUSD, 'USD')} / {formatCurrency(priceJPY || 0, 'JPY')}</span>
                </p>
            )}
            <p>
                中央価格: <span style={{ color: COLORS.median }}>{formatCurrency(data.medianModel, 'USD')} / {formatCurrency(data.medianModel * exchangeRate, 'JPY')}</span>
            </p>
            <p>
                下限価格: <span style={{ color: COLORS.support }}>{formatCurrency(data.supportModel, 'USD')} / {formatCurrency(data.supportModel * exchangeRate, 'JPY')}</span>
            </p>
            {isCurrentData && pointPosition !== null && (
                <p className="mt-2 pt-2 border-t border-gray-600">
                    パワーロー位置: <span style={{ color: getPowerLawPositionColorSoft(pointPosition), fontWeight: 'bold' }}>{formatPercentage(pointPosition)}</span>{' '}
                    <span className="text-xs opacity-80">({getPowerLawPositionLabel(pointPosition)})</span>
                </p>
            )}
        </div>
    );
};

const generateYearTicks = (minDays: number, maxDays: number) => {
    const ticks = [];
    let year = 2010;
    while (true) {
        const dateOfYear = new Date(year, 0, 1);
        const days = getDaysSinceGenesis(dateOfYear);
        if (days > maxDays) break;
        if (days >= minDays) {
            ticks.push(days);
        }
        year += 2;
        if (year > 2040) break;
    }
    return ticks;
};

const PowerLawChart: React.FC<PowerLawChartProps> = ({
    exchangeRate = 150.0,
    rSquared,
    chartData,
    currentPrice,
    height = 400,
    showPositionInfo = true,
    isZoomed = false,
    powerLawPosition = null,
    xAxisScale = 'linear',
    yAxisScale = 'log',
    showRSquared = true,
    chartTitle = "Bitcoin Price Chart",
}) => {
    const [isIntroVisible, setIsIntroVisible] = useState(false);
    const chartRef = useRef<any>(null);

    const dataWithDays = useMemo(() => {
        return chartData.map(point => ({
            ...point,
            daysSinceGenesis: getDaysSinceGenesis(new Date(point.date)),
        }));
    }, [chartData]);

    const { domain, yearTicks, yDomainMax } = useMemo(() => {
        if (!dataWithDays || dataWithDays.length === 0) {
            return { domain: [0, 0], yearTicks: [], yDomainMax: 1000 };
        }
        const minDays = Math.min(...dataWithDays.map((d) => d.daysSinceGenesis));
        const maxDays = Math.max(...dataWithDays.map((d) => d.daysSinceGenesis));
        const maxPrice = Math.max(
            ...dataWithDays.map(d => Math.max(d.price || 0, d.medianModel, d.supportModel))
        );
        const yMax = yAxisScale === 'log' ? Math.pow(10, Math.ceil(Math.log10(maxPrice * 1.2))) : maxPrice * 1.2;
        return { domain: [minDays, maxDays], yearTicks: generateYearTicks(minDays, maxDays), yDomainMax: yMax };
    }, [dataWithDays, yAxisScale]);

    const currentPriceDate = useMemo(() => {
        if (!chartData || chartData.length === 0) return null;
        const now = Date.now();
        let closest = null;
        let closestDiff = Infinity;

        for (const point of chartData) {
            if (point.price !== null) {
                const diff = Math.abs(point.date - now);
                if (diff < closestDiff) {
                    closestDiff = diff;
                    closest = point;
                }
            }
        }
        return closest ? closest.date : null;
    }, [chartData]);

    const handleToggleIntro = useCallback(() => {
        // setIsIntroVisible((prev) => !prev);
    }, []);

    if (!chartData || chartData.length === 0) {
        return (
            <div className="text-gray-400 text-center p-2 bg-gray-800 bg-opacity-50 rounded-lg" aria-label="データがありません">
                データがありません
            </div>
        );
    }

    const hasPastData = chartData.some((item) => !item.isFuture && item.price !== null);
    if (!hasPastData) {
        return (
            <div className="text-gray-400 text-center p-2 bg-gray-800 bg-opacity-50 rounded-lg" aria-label="過去の価格データがロードされていません">
                過去の価格データがロードされていません
            </div>
        );
    }

    console.log("PowerLawChart: Applying plot area background color:", COLORS.plotAreaBg);
    console.log("PowerLawChart: Y-axis domain max:", yDomainMax);

    return (
        <div className="bg-transparent overflow-hidden relative rounded-lg">
            {chartTitle && (
                <h2 className="text-center text-lg font-medium text-amber-400 mb-4">{chartTitle}</h2>
            )}
            <ResponsiveContainer width="100%" height={height} ref={chartRef}>
                <LineChart
                    data={dataWithDays}
                    margin={CHART_CONFIG.MARGIN}
                    aria-describedby="chart-description"
                >
                    {/* プロットエリア全体を黒で塗りつぶす */}
                    <ReferenceArea
                        x1={domain[0]}
                        x2={domain[1]}
                        y1={yAxisScale === 'log' ? 0.1 : 0}
                        y2={yDomainMax}
                        fill={COLORS.plotAreaBg}
                        fillOpacity={1}
                        yAxisId="left"
                        strokeWidth={0}
                    />

                    <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" opacity={0.5} vertical={true} horizontal={true} />
                    <Legend
                        verticalAlign="bottom"
                        align="right"
                        wrapperStyle={{ color: COLORS.legendText, fontSize: '12px', padding: '5px 10px', borderRadius: '4px', backgroundColor: 'transparent', bottom: 20, right: 20, position: 'absolute' }}
                        formatter={(value) => {
                            const color = value === 'price' ? COLORS.price : value === 'medianModel' ? COLORS.median : value === 'supportModel' ? COLORS.support : COLORS.legendText;
                            return (
                                <span style={{ color, marginRight: '15px', fontWeight: 500 }}>
                                    {value === 'price' ? '実際価格' : value === 'medianModel' ? '中央価格 (予測)' : value === 'supportModel' ? '下限価格 (予測)' : value}
                                </span>
                            );
                        }}
                        layout="horizontal"
                    />
                    {HALVING_EVENTS.map((event, index) => {
                        const eventDate = new Date(event.date).getTime();
                        if (eventDate >= domain[0] && eventDate <= domain[1]) {
                            return (
                                <ReferenceArea
                                    key={`halving-${index}`}
                                    x1={eventDate - 3 * 24 * 60 * 60 * 1000}
                                    x2={eventDate + 3 * 24 * 60 * 60 * 1000}
                                    fill={COLORS.halving}
                                    fillOpacity={0.5}
                                    yAxisId="left"
                                    strokeWidth={0}
                                >
                                    <Label value={event.label} position="insideTop" fill="#fff" fontSize={11} fontWeight="normal" offset={10} opacity={0.8} />
                                </ReferenceArea>
                            );
                        } else if (eventDate <= domain[0] && index === 0) {
                            return (
                                <ReferenceLine
                                    key={`halving-line-${index}`}
                                    x={eventDate}
                                    stroke="#FFD700"
                                    strokeWidth={1.5}
                                    strokeDasharray="3 3"
                                    yAxisId="left"
                                >
                                    <Label value={event.label} position="top" fill="#FFD700" fontSize={12} fontWeight="bold" />
                                </ReferenceLine>
                            );
                        }
                        return null;
                    })}

                    <XAxis
                        dataKey="daysSinceGenesis"
                        stroke="#fff"
                        tickLine={false}
                        axisLine={true}
                        tickFormatter={(days) => new Date(new Date('2009-01-03').getTime() + days * 86400000).getFullYear().toString()}
                        tick={{ fontSize: 12, fill: COLORS.legendText, fontWeight: 'bold' }}
                        ticks={yearTicks}
                        domain={domain}
                        allowDataOverflow={true}
                        type="number"
                        scale={xAxisScale}
                        minTickGap={15}
                        accessibility={{ enabled: true }}
                        aria-label="年"
                    />

                    <YAxis
                        yAxisId="left"
                        stroke="#fff"
                        tickLine={false}
                        axisLine={true}
                        scale={yAxisScale}
                        domain={[yAxisScale === 'log' ? 0.1 : 0, yDomainMax]}
                        tickFormatter={(value) => formatCurrency(value, 'JPY').replace(/[\$,]/g, '').replace('JPY', '¥')}
                        tick={{ fontSize: 11, fill: COLORS.legendText }}
                        width={70}
                        label={{ value: '価格 (円)', angle: -90, position: 'insideLeft', style: { fill: '#fff', fontSize: 12, fontWeight: 500 }, dx: -10 }}
                        aria-label="価格軸 (対数スケール)"
                    />
                    <Tooltip
                        content={<TooltipContent exchangeRate={exchangeRate} currentPrice={currentPrice} powerLawPosition={powerLawPosition} />}
                        wrapperStyle={{ outline: 'none', fontSize: '12px' }}
                        isAnimationActive={true}
                        animationDuration={CHART_CONFIG.ANIMATION_DURATION}
                    />

                    {currentPriceDate && (
                        <ReferenceLine
                            x={currentPriceDate}
                            stroke="#ffffff"
                            strokeDasharray="3 3"
                            strokeWidth={CHART_CONFIG.REFERENCE_LINE_WIDTH}
                            yAxisId="left"
                            animationDuration={CHART_CONFIG.ANIMATION_DURATION}
                        >
                            <Label value="現在" position="top" fill="#ffffff" fontSize={12} fontWeight="bold" offset={15} style={{ transition: 'all 0.3s ease' }} />
                        </ReferenceLine>
                    )}

                    <ReferenceArea
                        y1={0}
                        y2={dataWithDays.reduce((min, p) => p.supportModel < min ? p.supportModel : min, Infinity)}
                        fill={COLORS.supportArea}
                        fillOpacity={0.2} // 不透明度を下げて背景が見えるように
                        yAxisId="left"
                    />
                    <ReferenceArea
                        y1={dataWithDays.reduce((min, p) => p.supportModel < min ? p.supportModel : min, Infinity)}
                        y2={dataWithDays.reduce((max, p) => p.medianModel > max ? p.medianModel : max, -Infinity)}
                        fill={COLORS.priceArea}
                        fillOpacity={0.2} // 不透明度を下げて背景が見えるように
                        yAxisId="left"
                    />

                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="price"
                        name="実際価格"
                        stroke={COLORS.price}
                        strokeWidth={CHART_CONFIG.PRICE_LINE_WIDTH}
                        dot={false}
                        connectNulls={true}
                        isAnimationActive={true}
                        animationDuration={CHART_CONFIG.ANIMATION_DURATION}
                        activeDot={{ r: 5, fill: COLORS.price, strokeWidth: 1, stroke: '#fff', animationDuration: 300 }}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="medianModel"
                        name="中央価格 (予測)"
                        stroke={COLORS.median}
                        strokeWidth={CHART_CONFIG.MODEL_LINE_WIDTH}
                        dot={false}
                        strokeDasharray="5 5"
                        connectNulls={true}
                        isAnimationActive={true}
                        animationDuration={CHART_CONFIG.ANIMATION_DURATION}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="supportModel"
                        name="下限価格 (予測)"
                        stroke={COLORS.support}
                        strokeWidth={CHART_CONFIG.MODEL_LINE_WIDTH}
                        dot={false}
                        connectNulls={true}
                        isAnimationActive={true}
                        animationDuration={CHART_CONFIG.ANIMATION_DURATION}
                    />
                </LineChart>
            </ResponsiveContainer>

            {showRSquared && rSquared !== null && (
                <div
                    className="absolute top-2 left-4 bg-gray-800 bg-opacity-90 text-white rounded-lg p-2 shadow-lg transition-all duration-300 hover:bg-opacity-100 border border-gray-700"
                    style={{ zIndex: 10 }}
                    aria-label={`決定係数: ${rSquared.toFixed(4)}`}
                >
                    <span className="font-medium">決定係数 (R²): </span>
                    <span className="font-bold text-amber-400">{rSquared.toFixed(4)}</span>
                </div>
            )}
        </div>
    );
};

export default PowerLawChart;

