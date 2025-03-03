import React, { useMemo, useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea, Legend, Label } from 'recharts';
import { useBitcoinDailyData } from '../../hooks/useBitcoinDailyData';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { getDaysSinceGenesis } from '../../utils/dateUtils';
import { calculateRSquared, log10, fromLog10, calculatePowerLawPosition, getPowerLawPositionLabel, getPowerLawPositionColor } from '../../utils/mathUtils';
import { eachYearOfInterval, eachMonthOfInterval, eachWeekOfInterval, subYears, differenceInDays, addDays, parseISO, format, isAfter } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';

const BITCOIN_GENESIS_DATE = new Date(2009, 0, 3);
const HALVING_EVENTS = [
    { date: '2012-11-28', label: '第1回', description: '報酬が25BTCに半減' },
    { date: '2016-07-09', label: '第2回', description: '報酬が12.5BTCに半減' },
    { date: '2020-05-11', label: '第3回', description: '報酬が6.25BTCに半減' },
    { date: '2024-04-20', label: '第4回', description: '報酬が3.125BTCに半減' },
];
const WEEKLY_DATA_CUTOFF = new Date('2023-12-31'); // 週次データの終了日
const COLORS = { price: '#FF9500', median: '#3DDC84', support: '#FF2D55', grid: '#39394B', halving: 'rgba(255, 255, 255, 0.1)' };
const CHART_CONFIG = { ANIMATION_DURATION: 0, PRICE_LINE_WIDTH: 1.2, MODEL_LINE_WIDTH: 1.5 };

// パワーローモデルのパラメータ
const MEDIAN_MODEL_A = -17.01593313;  // 中央価格の切片
const MEDIAN_MODEL_B = 5.84509376;    // 中央価格の傾き
const SUPPORT_MODEL_A = -17.668;      // 下限価格の切片
const SUPPORT_MODEL_B = 5.926;        // 下限価格の傾き
const MIN_LOG_VALUE = 0.00001;        // ログスケールの最小値（2010年以降の価格に適合）

// CustomLegend コンポーネント
const CustomLegend = React.memo(() => (
    <div className="flex gap-2 sm:gap-6 justify-end flex-wrap">
        <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: COLORS.price }} />
            <span className="text-gray-200 text-xs sm:text-sm">実際価格</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: COLORS.median }} />
            <span className="text-gray-200 text-xs sm:text-sm">中央価格</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: COLORS.support }} />
            <span className="text-gray-200 text-xs sm:text-sm">下限価格</span>
        </div>
    </div>
));

const BitcoinExtendedPowerLawChart = ({
    exchangeRate = 150.0,
    rSquared: propRSquared
}) => {
    const [weeklyPrices, setWeeklyPrices] = useState([]);
    const { loading, dailyPrices, currentPrice, error } = useBitcoinDailyData();
    const isMobile = useMediaQuery('(max-width: 640px)');

    // weeklyPrices.json を取得
    useEffect(() => {
        fetch('/weeklyPrices.json')
            .then(response => response.json())
            .then(data => setWeeklyPrices(data))
            .catch(err => console.error('Failed to load weeklyPrices.json:', err));
    }, []);

    // 2010年から2040年までの均等な時間間隔（月次）のタイムスタンプを生成
    const uniformTimestamps = useMemo(() => {
        const startDate = new Date('2010-01-01');
        const endDate = new Date('2040-12-31');

        // 月ごとのタイムスタンプを生成
        return eachMonthOfInterval({ start: startDate, end: endDate }).map(date => date.getTime());
    }, []);

    // 実際のデータポイントをマップに変換（検索を高速化）
    const priceDataMap = useMemo(() => {
        if (!weeklyPrices.length || !dailyPrices.length) return new Map();

        const dataMap = new Map();

        // 週次データを2023-12-31までマッピング
        weeklyPrices
            .filter(wp => new Date(wp.date) <= WEEKLY_DATA_CUTOFF)
            .forEach(wp => {
                dataMap.set(new Date(wp.date).getTime(), {
                    price: wp.price,
                    source: 'weekly'
                });
            });

        // 日次データを2024-01-01以降マッピング
        dailyPrices
            .filter(dp => new Date(dp.date) > WEEKLY_DATA_CUTOFF)
            .forEach(dp => {
                dataMap.set(new Date(dp.date).getTime(), {
                    price: dp.price,
                    source: 'daily'
                });
            });

        // 最新価格を追加
        if (currentPrice?.prices?.usd) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dataMap.set(today.getTime(), {
                price: currentPrice.prices.usd,
                source: 'current'
            });
        }

        return dataMap;
    }, [weeklyPrices, dailyPrices, currentPrice]);

    // チャートデータ生成 - 均等な月次間隔で2010〜2040年
    const chartData = useMemo(() => {
        if (!uniformTimestamps.length || priceDataMap.size === 0) return [];

        const data = [];
        const today = new Date().getTime();

        uniformTimestamps.forEach(timestamp => {
            const date = new Date(timestamp);
            const daysSinceGenesis = Math.max(1, getDaysSinceGenesis(date));

            // パワーローモデル計算
            const medianModelLog = MEDIAN_MODEL_A + MEDIAN_MODEL_B * log10(daysSinceGenesis);
            const supportModelLog = SUPPORT_MODEL_A + SUPPORT_MODEL_B * log10(daysSinceGenesis);

            // 実際の価格に変換
            const medianPrice = Math.pow(10, medianModelLog);
            const supportPrice = Math.pow(10, supportModelLog);

            // 実際の価格データ（現在日付以前のみ）
            let price = null;
            let source = 'model';

            if (timestamp <= today) {
                // 正確に一致するデータポイントを探す
                if (priceDataMap.has(timestamp)) {
                    const priceData = priceDataMap.get(timestamp);
                    price = priceData.price;
                    source = priceData.source;
                } else {
                    // 最も近いデータポイントを探す（30日以内）
                    let closestTimestamp = null;
                    let minDiff = 30 * 24 * 60 * 60 * 1000; // 30日（ミリ秒）

                    priceDataMap.forEach((_, time) => {
                        const diff = Math.abs(time - timestamp);
                        if (diff < minDiff) {
                            minDiff = diff;
                            closestTimestamp = time;
                        }
                    });

                    if (closestTimestamp !== null) {
                        const priceData = priceDataMap.get(closestTimestamp);
                        price = priceData.price;
                        source = priceData.source + '-interpolated';
                    }
                }
            }

            data.push({
                date: timestamp,
                medianModel: Math.max(MIN_LOG_VALUE, medianPrice),
                supportModel: Math.max(MIN_LOG_VALUE, supportPrice),
                price: price !== null && !isNaN(price) ? price : null,
                priceJPY: price !== null && !isNaN(price) ? price * exchangeRate : null,
                medianModelJPY: Math.max(MIN_LOG_VALUE, medianPrice) * exchangeRate,
                supportModelJPY: Math.max(MIN_LOG_VALUE, supportPrice) * exchangeRate,
                source: source,
                isFuture: timestamp > today
            });
        });

        return data;
    }, [uniformTimestamps, priceDataMap, exchangeRate]);

    // R²計算
    const rSquared = useMemo(() => {
        if (propRSquared !== undefined) return propRSquared;

        if (!chartData.length) return 0.9579;
        const rSquaredData = chartData
            .filter(d => d.price !== null && d.price > 0)
            .map(d => [d.date, d.price]);
        const calculatedRSquared = calculateRSquared(rSquaredData);
        return calculatedRSquared !== null ? calculatedRSquared : 0.9579;
    }, [chartData, propRSquared]);

    // 半減期エリアの計算
    const halvingReferenceAreas = useMemo(() => {
        if (!chartData || chartData.length === 0) return [];

        return HALVING_EVENTS
            .filter(event => {
                const eventDate = new Date(event.date).getTime();
                return chartData.some(item => item.date === eventDate ||
                    (chartData[0].date <= eventDate && eventDate <= chartData[chartData.length - 1].date));
            })
            .map(event => {
                const eventDate = new Date(event.date).getTime();
                const eventIndex = chartData.findIndex(item => item.date === eventDate);
                let startIndex, endIndex;

                if (eventIndex === -1) {
                    const nearestIndex = chartData.reduce((nearest, item, index) => {
                        const currentDiff = Math.abs(item.date - eventDate);
                        const nearestDiff = nearest.index !== -1 ? Math.abs(chartData[nearest.index].date - eventDate) : Infinity;
                        return currentDiff < nearestDiff ? { index, diff: currentDiff } : nearest;
                    }, { index: -1, diff: Infinity }).index;

                    if (nearestIndex === -1) return null;
                    startIndex = Math.max(0, nearestIndex - 3);
                    endIndex = Math.min(chartData.length - 1, nearestIndex + 3);
                } else {
                    startIndex = Math.max(0, eventIndex - 3);
                    endIndex = Math.min(chartData.length - 1, eventIndex + 3);
                }

                return {
                    event,
                    x1: chartData[startIndex].date,
                    x2: chartData[endIndex].date
                };
            })
            .filter(Boolean);
    }, [chartData]);

    if (loading || !weeklyPrices.length) return <div className="text-gray-300 flex justify-center items-center h-48">Loading...</div>;
    if (error) return <div className="text-red-500 text-center">Error: {error}</div>;

    return (
        <div className="bg-gray-900 rounded-lg p-2 sm:p-4 shadow-lg text-gray-100">
            <div className="flex justify-between items-center mb-2 sm:mb-4">
                <div className="text-sm text-gray-300">
                    決定係数 (R²): {rSquared.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                </div>
                <div className="flex items-center">
                    <div className="text-xs text-gray-400 mr-4">
                        最終更新: {currentPrice ? new Date(currentPrice.timestamp).toLocaleString() : '不明'}
                    </div>
                    <CustomLegend />
                </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-0 sm:p-2 relative">
                <ResponsiveContainer width="100%" height={isMobile ? 400 : 550}>
                    <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                        <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
                        {halvingReferenceAreas.map((area, index) => (
                            <ReferenceArea
                                key={`halving-${index}`}
                                x1={area.x1}
                                x2={area.x2}
                                fill={COLORS.halving}
                                fillOpacity={0.8}
                                strokeOpacity={0}
                            >
                                <Label
                                    value={area.event.label}
                                    position="insideTop"
                                    fill="#fff"
                                    fontSize={10}
                                />
                            </ReferenceArea>
                        ))}
                        <XAxis
                            dataKey="date"
                            stroke="#fff"
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(date) => new Date(date).getFullYear().toString()}
                            tick={{ fontSize: 10 }}
                            minTickGap={50}
                            height={30}
                            // 均等間隔でティックを表示
                            ticks={[
                                new Date('2010-01-01').getTime(),
                                new Date('2015-01-01').getTime(),
                                new Date('2020-01-01').getTime(),
                                new Date('2025-01-01').getTime(),
                                new Date('2030-01-01').getTime(),
                                new Date('2035-01-01').getTime(),
                                new Date('2040-01-01').getTime(),
                            ]}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke="#fff"
                            tickLine={false}
                            axisLine={false}
                            scale="log"
                            domain={[0.1, 'auto']}
                            tickFormatter={(value) => formatCurrency(value, 'JPY').replace(/[¥,]/g, '')}
                            tick={{ fontSize: 11 }}
                            width={45}
                        />
                        <Tooltip content={<TooltipContent exchangeRate={exchangeRate} />} />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="supportModel"
                            name="下限価格"
                            stroke={COLORS.support}
                            strokeWidth={CHART_CONFIG.MODEL_LINE_WIDTH}
                            dot={false}
                            isAnimationActive={false}
                            animationDuration={CHART_CONFIG.ANIMATION_DURATION}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="medianModel"
                            name="中央価格"
                            stroke={COLORS.median}
                            strokeWidth={CHART_CONFIG.MODEL_LINE_WIDTH}
                            dot={false}
                            strokeDasharray="5 5"
                            isAnimationActive={false}
                            animationDuration={CHART_CONFIG.ANIMATION_DURATION}
                        />
                        <Line
                            yAxisId="left"
                            type="linear"
                            dataKey="price"
                            name="実際価格"
                            stroke={COLORS.price}
                            strokeWidth={CHART_CONFIG.PRICE_LINE_WIDTH}
                            dot={false}
                            connectNulls={true}
                            isAnimationActive={false}
                            animationDuration={CHART_CONFIG.ANIMATION_DURATION}
                            style={{ strokeLinecap: 'butt', strokeLinejoin: 'miter', vectorEffect: 'non-scaling-stroke' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>


        </div>
    );
};

// カスタムツールチップ
const TooltipContent = ({ active, payload, exchangeRate = 150.0 }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    const powerLawRatio = data.price && data.medianModel ? ((data.price / data.medianModel - 1) * 100).toFixed(1) : null;
    const range = data.medianModel - data.supportModel;
    const position = range > 0 && data.price ? ((data.price - data.supportModel) / range) * 100 : null;

    const getPositionEvaluation = (pos) => {
        if (pos === null || pos === undefined) return { text: "計算不能", color: "text-gray-400" };
        if (pos <= 0) return { text: "非常に割安", color: "text-green-500" };
        if (pos <= 40) return { text: "割安", color: "text-green-400" };
        if (pos <= 80) return { text: "やや割安", color: "text-green-300" };
        if (pos <= 120) return { text: "適正", color: "text-yellow-400" };
        if (pos <= 170) return { text: "やや割高", color: "text-orange-300" };
        if (pos <= 240) return { text: "割高", color: "text-red-400" };
        return { text: "非常に割高", color: "text-red-600" };
    };

    const positionEvaluation = getPositionEvaluation(position);
    const positionLabel = position !== null ?
        position < 0 ? `下限価格より${Math.abs(position).toFixed(1)}%下` :
            position === 0 ? '下限価格と同じ' :
                position < 100 ? `下限〜中央の間 (${position.toFixed(0)}%)` :
                    position === 100 ? '中央価格と同じ' :
                        `中央価格より${(position - 100).toFixed(1)}%上` : "計算不能";

    return (
        <div className="bg-gray-800 p-3 rounded-md text-gray-100">
            <div className="font-semibold">{new Date(data.date).toLocaleDateString()}</div>

            {data.price && (
                <div className="mt-1">
                    <span className="text-gray-300">実際価格: </span>
                    <span className="font-medium text-yellow-500">{formatCurrency(data.price, 'JPY')}</span>
                    <span className="text-xs text-gray-400 ml-1">({formatCurrency(data.price, 'USD')})</span>
                </div>
            )}

            <div className="mt-1">
                <span className="text-gray-300">中央価格: </span>
                <span className="font-medium text-green-400">{formatCurrency(data.medianModel * exchangeRate, 'JPY')}</span>
                <span className="text-xs text-gray-400 ml-1">({formatCurrency(data.medianModel, 'USD')})</span>
            </div>

            <div className="mt-1">
                <span className="text-gray-300">下限価格: </span>
                <span className="font-medium text-red-500">{formatCurrency(data.supportModel * exchangeRate, 'JPY')}</span>
                <span className="text-xs text-gray-400 ml-1">({formatCurrency(data.supportModel, 'USD')})</span>
            </div>

            {powerLawRatio && (
                <div className="mt-2">
                    <span className="text-gray-300">パワーロー比: </span>
                    <span className={`font-medium ${powerLawRatio > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(powerLawRatio > 0 ? '+' : '') + powerLawRatio}%
                    </span>
                </div>
            )}

            {position !== null && (
                <div className={`mt-1 ${positionEvaluation.color}`}>
                    <span className="text-gray-300">市場評価: </span>
                    <span className="font-medium">{positionEvaluation.text}</span>
                    <div className="text-xs mt-0.5">{positionLabel}</div>
                </div>
            )}

            {data.isFuture && (
                <div className="mt-2 text-xs text-blue-400">
                    将来予測データ
                </div>
            )}
        </div>
    );
};

export default BitcoinExtendedPowerLawChart;