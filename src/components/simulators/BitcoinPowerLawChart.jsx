import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Brush, ReferenceArea, Label
} from 'recharts';
import { HelpCircle, RefreshCw, Download, Calendar } from 'lucide-react';
import useBitcoinChartData from '../../hooks/useBitcoinChartData';
import { fromLog10 } from '../../utils/mathUtils';
import { toJapaneseDate, toShortJapaneseDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';
import ChartTooltip from '../../components/common/ChartTooltip'; // ChartTooltip をインポート

// チャートの色設定
const COLORS = {
    price: '#F7931A',         // 実際価格の色 (オレンジ)
    median: '#4CAF50',        // 中央価格の色 (緑)
    support: '#FF5252',       // 下限価格の色 (赤)
    grid: '#2A2A2A',          // グリッドの色 (ダークグレー)
    background: '#121212',    // 背景色 (ダークグレー)
    halving: 'rgba(255, 255, 255, 0.1)' // 半減期エリアの色 (半透明の白)
};

// ビットコインの半減期イベント
const BITCOIN_EVENTS = [
    { date: '2012-11-28', label: '第1回', description: '報酬が25BTCに半減' },
    { date: '2016-07-09', label: '第2回', description: '報酬が12.5BTCに半減' },
    { date: '2020-05-11', label: '第3回', description: '報酬が6.25BTCに半減' },
    { date: '2024-04-20', label: '第4回', description: '報酬が3.125BTCに半減' },
];

// ツールチップアイコンコンポーネント(Home.jsxで定義されているのでここでは定義しない)
// const TooltipIcon = ({ content }) => ( ... );

// 日付範囲セレクターコンポーネント
const DateRangeSelector = ({ selectedRange, onRangeChange }) => (
    <div className="flex items-center">
        <Calendar className="h-4 w-4 mr-2 text-gray-300" />
        <div className="flex bg-gray-800 rounded-md overflow-hidden">
            {['all', '10y', '5y', '2y', '1y', '6m'].map(range => (
                <button
                    key={range}
                    className={`px-3 py-1 text-sm transition-colors ${selectedRange === range
                        ? 'bg-blue-600 text-white'
                        : 'bg-transparent text-gray-300 hover:bg-gray-700'}`}
                    onClick={() => onRangeChange(range)}
                >
                    {range === 'all' ? '全期間' :
                        range === '10y' ? '10年' :
                            range === '5y' ? '5年' :
                                range === '2y' ? '2年' :
                                    range === '1y' ? '1年' :
                                        range === '6m' ? '6ヶ月' : ''}
                </button>
            ))}
        </div>
    </div>
);

// カスタム凡例コンポーネント
const CustomLegend = ({ payload }) => {
    if (!payload || !payload.length) {
        return null; // 凡例データがない場合は何も表示しない
    }

    const labelMap = {
        price: '実際価格',
        medianModel: '中央価格',
        supportModel: '下限価格',
    };

    return (
        <div className="flex gap-6 justify-end flex-wrap">
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-gray-200 text-sm">{labelMap[entry.dataKey] || entry.dataKey}</span>
                </div>
            ))}
        </div>
    );
};

// メインコンポーネント (BitcoinPowerLawChart)
const BitcoinPowerLawChart = React.memo(({ exchangeRate = 150 }) => {
    const chartData = useBitcoinChartData(exchangeRate);

    const [selectedRange, setSelectedRange] = useState('all');
    const [displayedDateRange, setDisplayedDateRange] = useState({ startIndex: 0, endIndex: 0 });

    // データ更新関数, 使わないので削除

    // 期間変更ハンドラー
    const handleRangeChange = useCallback((range) => {
        setSelectedRange(range);
    }, []);

    // 表示範囲計算関数 (変更なし)
    const calculateDateRange = useCallback((data, range) => {
        if (!data || data.length === 0) return { startIndex: 0, endIndex: 0 };

        const endIndex = data.length - 1;
        let startIndex = 0;
        const today = new Date();

        switch (range) {
            case '10y':
                const tenYearsAgo = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
                startIndex = Math.max(0, data.findIndex(item => new Date(item.date) >= tenYearsAgo));
                break;
            case '5y':
                const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
                startIndex = Math.max(0, data.findIndex(item => new Date(item.date) >= fiveYearsAgo));
                break;
            case '2y':
                const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
                startIndex = Math.max(0, data.findIndex(item => new Date(item.date) >= twoYearsAgo));
                break;
            case '1y':
                const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
                startIndex = Math.max(0, data.findIndex(item => new Date(item.date) >= oneYearAgo));
                break;
            case '6m':
                const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
                startIndex = Math.max(0, data.findIndex(item => new Date(item.date) >= sixMonthsAgo));
                break;
            case 'all':
            default:
                startIndex = 0;
                break;
        }

        return { startIndex, endIndex };
    }, []);

    // 表示範囲が変更されたときに、表示データを更新
    useEffect(() => {
        if (chartData.data) {
            setDisplayedDateRange(calculateDateRange(chartData.data, selectedRange));
        }
    }, [chartData.data, selectedRange, calculateDateRange]);

    // 表示データ (選択された範囲にフィルタリング)
    const displayedData = useMemo(() => {
        if (!chartData.data) return [];
        return chartData.data.slice(
            displayedDateRange.startIndex,
            displayedDateRange.endIndex + 1
        );
    }, [chartData.data, displayedDateRange]);

    // 半減期エリアの計算 (変更なし)
    const halvingReferenceAreas = useMemo(() => {
        if (!displayedData || displayedData.length === 0) return [];

        return BITCOIN_EVENTS
            .filter(event => {
                const eventDate = event.date;
                return displayedData.some(item => item.date === eventDate ||
                    (displayedData[0].date <= eventDate && eventDate <= displayedData[displayedData.length - 1].date));
            })
            .map(event => {
                const eventIndex = displayedData.findIndex(item => item.date === event.date);
                if (eventIndex === -1) return null;

                const totalDays = displayedData.length;
                const width = Math.max(1, Math.min(7, Math.ceil(totalDays / 100)));

                const start = Math.max(0, eventIndex - width);
                const end = Math.min(displayedData.length - 1, eventIndex + width);

                return {
                    event,
                    startDate: displayedData[start].date,
                    endDate: displayedData[end].date
                };
            })
            .filter(Boolean);
    }, [displayedData]);


    // CSVダウンロード関数, 使わないので削除

    // ローディング中の表示
    if (chartData.loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // エラー発生時の表示
    if (chartData.error) {
        return (
            <div className="bg-red-900/30 border border-red-700 rounded-md p-4 mb-4 text-red-200">
                <div className="flex items-start">
                    <div>
                        <h3 className="font-semibold">データ読み込みエラー</h3>
                        <p>{chartData.error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // チャートのレンダリング
    return (
        <div className="bg-gray-900 rounded-lg p-4 shadow-lg text-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                {/* 削除 */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* 日付範囲セレクター */}
                    <DateRangeSelector
                        selectedRange={selectedRange}
                        onRangeChange={handleRangeChange}
                    />
                </div>
            </div>

            {/* チャート本体 */}
            {!chartData.loading && chartData.data && chartData.data.length > 0 && (
                <>
                    <div className="mb-4 text-xs text-gray-400 text-right">
                        <span>最終更新: {chartData.lastUpdated}</span>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-2">
                        <ResponsiveContainer width="100%" height={550}>
                            <LineChart
                                data={displayedData}
                                margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
                            >
                                {/* グリッド */}
                                <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />

                                {/* 半減期エリア */}
                                {halvingReferenceAreas.map((area, index) => (
                                    <ReferenceArea
                                        key={`halving-${index}`}
                                        x1={area.startDate}
                                        x2={area.endDate}
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

                                {/* X軸 (日付) */}
                                <XAxis
                                    dataKey="date"
                                    stroke="#fff"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(date) => {
                                        const totalDays = displayedData.length;
                                        // 表示期間に応じて日付フォーマットを調整
                                        if (totalDays > 365 * 4) {
                                            return new Date(date).getFullYear().toString();
                                        } else if (totalDays > 365) {
                                            return toShortJapaneseDate(date);
                                        }
                                        return toJapaneseDate(date);
                                    }}
                                    tick={{ fontSize: 11 }}
                                    minTickGap={30}
                                />

                                {/* Y軸 (価格) */}
                                <YAxis
                                    yAxisId="left"
                                    stroke="#fff"
                                    tickLine={false}
                                    axisLine={false}
                                    domain={['auto', 'auto']}
                                    tickFormatter={(logValue) => {
                                        const value = fromLog10(logValue);
                                        return formatCurrency(value, 'USD').replace(/[\$,]/g, '');
                                    }}
                                    tick={{ fontSize: 11 }}
                                />

                                {/* ツールチップ */}
                                <Tooltip
                                    content={<ChartTooltip exchangeRate={exchangeRate} />}
                                    cursor={false} // カーソル非表示
                                />

                                {/* 中央価格ライン */}
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="medianModel"
                                    stroke={COLORS.median}
                                    strokeWidth={2}
                                    dot={false}
                                    name="中央価格"
                                    strokeDasharray="5 5"
                                />

                                {/* 下限価格ライン */}
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="supportModel"
                                    stroke={COLORS.support}
                                    strokeWidth={2}
                                    dot={false}
                                    name="下限価格"
                                />

                                {/* 実際価格ライン */}
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="price"
                                    stroke={COLORS.price}
                                    strokeWidth={2}
                                    dot={{ stroke: COLORS.price, strokeWidth: 1, r: 1, fill: COLORS.price }}
                                    activeDot={{ r: 6 }}
                                    name="実際価格"
                                    connectNulls={false}
                                />

                                {/* ブラシ (範囲選択) */}
                                <Brush
                                    dataKey="date"
                                    height={30}
                                    stroke={COLORS.median}
                                    fill="rgba(70, 70, 70, 0.1)"
                                    startIndex={displayedDateRange.startIndex}
                                    endIndex={displayedDateRange.endIndex}
                                >
                                    <LineChart>
                                        {/* ブラシ内のミニチャート (実際価格) */}
                                        <Line dataKey="price" stroke={COLORS.price} dot={false} strokeWidth={1} />
                                    </LineChart>
                                </Brush>

                                {/* 凡例 */}
                                <Legend
                                    content={<CustomLegend />}
                                    verticalAlign="top"
                                    align="right"
                                    wrapperStyle={{ top: 0, right: 10 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 説明文 */}
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-400">
                        <div className="bg-gray-800 rounded-md p-3">
                            <h4 className="font-semibold mb-1 text-gray-300">パワーローモデルについて</h4>
                            <p>ビットコインの価格成長は時間の累乗関数（パワーロー）に従う傾向があります。中央値モデルはビットコイン価格が最も滞在しやすい中心的な価格帯を表し、下限値モデルは過去のビットコイン価格が歴史的に下回ったことがない最低水準を示します。</p>
                        </div>

                        <div className="bg-gray-800 rounded-md p-3">
                            <h4 className="font-semibold mb-1 text-gray-300">注意事項</h4>
                            <p>このモデルは価格予測や投資アドバイスではありません。歴史的なトレンドの視覚化のみを目的としています。</p>
                        </div>
                        {/* 決定係数 (R^2) の表示 */}

                    </div>
                </>
            )}
        </div>
    );
});

export default BitcoinPowerLawChart;