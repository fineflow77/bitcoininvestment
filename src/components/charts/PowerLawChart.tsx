import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea, ReferenceLine, Label } from 'recharts';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { HALVING_EVENTS, CHART_TIME_RANGE } from '../../utils/constants'; // CHART_TIME_RANGE をインポート
import { getPowerLawPositionLabel, calculatePowerLawPosition } from '../../utils/models';
import { getDaysSinceGenesis } from '../../utils/dateUtils';

interface ChartDataPoint {
    date: number;
    price: number | null;
    medianModel: number;
    supportModel: number;
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

interface ZoomState {
    start: number;
    end: number;
    originalDomain: [number, number];
    isZooming: boolean;
    refAreaLeft: number | null;
    refAreaRight: number | null;
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
    plotAreaBg: '#000000',
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
    ZOOM_FACTOR: 0.2,
    MIN_ZOOM_AREA: 86400000,
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
    const date = new Date(data.date).toLocaleDateString('ja-JP', {
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
    const isCurrentTimePoint = Math.abs(data.date - new Date().getTime()) < 24 * 60 * 60 * 1000;
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
    chartData = [],
    currentPrice,
    height = 400,
    showPositionInfo = true,
    isZoomed = false,
    powerLawPosition = null,
    xAxisScale = 'log',
    yAxisScale = 'log',
    showRSquared = true,
    chartTitle = "Bitcoin Price Chart (Log-Log Scale)",
}) => {
    const [zoomState, setZoomState] = useState<ZoomState>({
        start: 0,
        end: 0,
        originalDomain: [0, 0],
        isZooming: false,
        refAreaLeft: null,
        refAreaRight: null,
    });

    const chartRef = useRef(null);

    const nowTimestamp = new Date().getTime();
    const chartEndTimestamp = new Date('2040-12-31').getTime();

    // 実際価格とモデルデータを分離
    const priceData = chartData.map(point => ({
        ...point,
        price: point.date <= nowTimestamp ? point.price : null,
    }));
    const modelData = chartData.filter(point => point.date <= chartEndTimestamp);

    const { domain, yearTicks, yDomainMin, yDomainMax } = useMemo(() => {
        if (!chartData.length) {
            return { domain: [1, 1], yearTicks: [], yDomainMin: 0.1, yDomainMax: 1000 };
        }
        const minDays = Math.max(1, Math.min(...chartData.map((d) => d.daysSinceGenesis)));
        const maxDays = Math.max(...chartData.map((d) => d.daysSinceGenesis));
        const prices = chartData.map(d => Math.max(d.price || 1, d.medianModel, d.supportModel)).filter(p => p > 0);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0.1;
        const maxPrice = prices.length > 0 ? Math.max(...prices) * 1.2 : 1000;
        const yMin = yAxisScale === 'log' ? Math.pow(10, Math.floor(Math.log10(minPrice))) : 0;
        const yMax = yAxisScale === 'log' ? Math.pow(10, Math.ceil(Math.log10(maxPrice))) : maxPrice;
        return { domain: [minDays, maxDays], yearTicks: generateYearTicks(minDays, maxDays), yDomainMin: yMin, yDomainMax: yMax };
    }, [chartData, yAxisScale]);

    useEffect(() => {
        setZoomState((prev) => ({
            ...prev,
            start: isZoomed ? prev.start : domain[0],
            end: isZoomed ? prev.end : domain[1],
            originalDomain: domain as [number, number],
        }));
    }, [domain, isZoomed]);

    const currentPriceDate = useMemo(() => {
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
        return closest ? closest.daysSinceGenesis : null;
    }, [chartData]);

    const handleMouseDown = useCallback((e: any) => {
        if (!e || !e.activeLabel) return;
        setZoomState((prev) => ({ ...prev, refAreaLeft: e.activeLabel as number, isZooming: true }));
    }, []);

    const handleMouseMove = useCallback((e: any) => {
        if (!e || !e.activeLabel || !zoomState.isZooming) return;
        setZoomState((prev) => ({ ...prev, refAreaRight: e.activeLabel as number }));
    }, [zoomState.isZooming]);

    const handleMouseUp = useCallback(() => {
        if (!zoomState.isZooming || !zoomState.refAreaLeft || !zoomState.refAreaRight) {
            setZoomState((prev) => ({ ...prev, isZooming: false, refAreaLeft: null, refAreaRight: null }));
            return;
        }
        let left = Math.min(zoomState.refAreaLeft, zoomState.refAreaRight);
        let right = Math.max(zoomState.refAreaLeft, zoomState.refAreaRight);
        if (right - left < CHART_CONFIG.MIN_ZOOM_AREA) {
            setZoomState((prev) => ({ ...prev, isZooming: false, refAreaLeft: null, refAreaRight: null }));
            return;
        }
        setZoomState({
            start: left,
            end: right,
            originalDomain: domain as [number, number],
            isZooming: false,
            refAreaLeft: null,
            refAreaRight: null,
        });
    }, [zoomState, domain]);

    const handleZoomIn = useCallback(() => {
        const range = zoomState.end - zoomState.start;
        const factor = range * CHART_CONFIG.ZOOM_FACTOR;
        setZoomState((prev) => ({ ...prev, start: prev.start + factor, end: prev.end - factor }));
    }, [zoomState]);

    const handleZoomOut = useCallback(() => {
        const range = zoomState.end - zoomState.start;
        const factor = range * CHART_CONFIG.ZOOM_FACTOR;
        const newStart = Math.max(zoomState.originalDomain[0], zoomState.start - factor);
        const newEnd = Math.min(zoomState.originalDomain[1], zoomState.end + factor);
        setZoomState((prev) => ({ ...prev, start: newStart, end: newEnd }));
    }, [zoomState]);

    const handleResetZoom = useCallback(() => {
        setZoomState((prev) => ({ ...prev, start: prev.originalDomain[0], end: prev.originalDomain[1] }));
    }, []);

    if (!chartData.length) {
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

    const currentDomain = [zoomState.start || domain[0], zoomState.end || domain[1]];

    return (
        <div className="bg-transparent overflow-hidden relative rounded-lg" style={{ backgroundColor: 'transparent' }}>
            {chartTitle && (
                <h2 className="text-center text-lg font-medium text-amber-400 mb-4">{chartTitle}</h2>
            )}
            <div className="absolute top-2 right-4 z-10">
                <div className="bg-gray-800 bg-opacity-90 rounded-lg p-1 flex items-center space-x-1 shadow-md border border-gray-700">
                    <button onClick={handleZoomIn} className="bg-gray-700 text-white px-3 py-1 rounded-l text-sm hover:bg-gray-600">+ 拡大</button>
                    <button onClick={handleZoomOut} className="bg-gray-700 text-white px-3 py-1 text-sm hover:bg-gray-600">- 縮小</button>
                    <button onClick={handleResetZoom} className="bg-gray-700 text-white px-3 py-1 rounded-r text-sm hover:bg-gray-600">リセット</button>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={height} ref={chartRef}>
                <LineChart
                    data={chartData}
                    margin={CHART_CONFIG.MARGIN}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                >
                    <ReferenceArea
                        x1={domain[0]}
                        x2={domain[1]}
                        y1={yDomainMin}
                        y2={yDomainMax}
                        fill={COLORS.plotAreaBg}
                        fillOpacity={1}
                        yAxisId="left"
                    />
                    <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" opacity={0.5} vertical={true} horizontal={true} />
                    <Legend
                        verticalAlign="bottom"
                        align="right"
                        wrapperStyle={{ color: COLORS.legendText, fontSize: '12px', padding: '5px 10px', bottom: 20, right: 20, position: 'absolute' }}
                        formatter={(value) => {
                            const color = value === 'price' ? COLORS.price : value === 'medianModel' ? COLORS.median : COLORS.support;
                            return (
                                <span style={{ color, marginRight: '15px', fontWeight: 500 }}>
                                    {value === 'price' ? '実際価格' : value === 'medianModel' ? '中央価格 (予測)' : '下限価格 (予測)'}
                                </span>
                            );
                        }}
                    />
                    {HALVING_EVENTS.map((event, index) => {
                        const eventDays = getDaysSinceGenesis(new Date(event.date));
                        if (eventDays >= currentDomain[0] && eventDays <= currentDomain[1]) {
                            return (
                                <ReferenceArea
                                    key={`halving-${index}`}
                                    x1={eventDays - 3}
                                    x2={eventDays + 3}
                                    fill={COLORS.halving}
                                    fillOpacity={0.5}
                                    yAxisId="left"
                                >
                                    <Label value={event.label} position="insideTop" fill="#fff" fontSize={11} opacity={0.8} />
                                </ReferenceArea>
                            );
                        }
                        return null;
                    })}
                    {zoomState.refAreaLeft && zoomState.refAreaRight && (
                        <ReferenceArea yAxisId="left" x1={zoomState.refAreaLeft} x2={zoomState.refAreaRight} strokeOpacity={0.3} fill="#fff" fillOpacity={0.3} />
                    )}
                    <XAxis
                        dataKey="daysSinceGenesis"
                        stroke="#fff"
                        tickLine={false}
                        axisLine={true}
                        tickFormatter={(days) => new Date(CHART_TIME_RANGE.START_DATE.getTime() + days * 86400000).getFullYear().toString()} // 修正済み
                        tick={{ fontSize: 12, fill: COLORS.legendText, fontWeight: 'bold' }}
                        ticks={yearTicks.filter((tick) => tick >= currentDomain[0] && tick <= currentDomain[1])}
                        domain={currentDomain}
                        allowDataOverflow={true}
                        type="number"
                        scale={xAxisScale}
                        minTickGap={15}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="#fff"
                        tickLine={false}
                        axisLine={true}
                        scale={yAxisScale}
                        domain={[yDomainMin, yDomainMax]}
                        allowDataOverflow={true}
                        tickFormatter={(value) => formatCurrency(value, 'JPY').replace(/[¥,]/g, '')}
                        tick={{ fontSize: 11, fill: COLORS.legendText }}
                        width={70}
                        label={{ value: '価格 (円)', angle: -90, position: 'insideLeft', style: { fill: '#fff', fontSize: 12, fontWeight: 500 }, dx: -10 }}
                    />
                    <Tooltip content={<TooltipContent exchangeRate={exchangeRate} currentPrice={currentPrice} powerLawPosition={powerLawPosition} />} />
                    {currentPriceDate && (
                        <ReferenceLine x={currentPriceDate} stroke="#ffffff" strokeDasharray="3 3" strokeWidth={CHART_CONFIG.REFERENCE_LINE_WIDTH} yAxisId="left">
                            <Label value="現在" position="top" fill="#ffffff" fontSize={12} fontWeight="bold" offset={15} />
                        </ReferenceLine>
                    )}
                    <ReferenceArea
                        y1={yDomainMin}
                        y2={modelData.reduce((min, p) => p.supportModel < min ? p.supportModel : min, Infinity)}
                        fill={COLORS.supportArea}
                        fillOpacity={0.05}
                        yAxisId="left"
                    />
                    <ReferenceArea
                        y1={modelData.reduce((min, p) => p.supportModel < min ? p.supportModel : min, Infinity)}
                        y2={modelData.reduce((max, p) => p.medianModel > max ? p.medianModel : max, -Infinity)}
                        fill={COLORS.priceArea}
                        fillOpacity={0.05}
                        yAxisId="left"
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="price"
                        stroke={COLORS.price}
                        strokeWidth={CHART_CONFIG.PRICE_LINE_WIDTH}
                        dot={false}
                        connectNulls={true}
                        data={priceData}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="medianModel"
                        stroke={COLORS.median}
                        strokeWidth={CHART_CONFIG.MODEL_LINE_WIDTH}
                        dot={false}
                        strokeDasharray="5 5"
                        connectNulls={true}
                        data={modelData}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="supportModel"
                        stroke={COLORS.support}
                        strokeWidth={CHART_CONFIG.MODEL_LINE_WIDTH}
                        dot={false}
                        connectNulls={true}
                        data={modelData}
                    />
                </LineChart>
            </ResponsiveContainer>
            {showRSquared && rSquared !== null && (
                <div className="absolute top-2 left-4 bg-gray-800 bg-opacity-90 text-white rounded-lg p-2 shadow-lg">
                    <span className="font-medium">決定係数 (R²): </span>
                    <span className="font-bold text-amber-400">{rSquared.toFixed(4)}</span>
                </div>
            )}
        </div>
    );
};

export default PowerLawChart;