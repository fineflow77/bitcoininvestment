import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Brush, ReferenceArea, Label
} from 'recharts';
import { HelpCircle, RefreshCw, Download, Calendar } from 'lucide-react';
import useBitcoinChartData from '../../hooks/useBitcoinChartData'; // カスタムフックをインポート
import { fromLog10 } from '../../utils/mathUtils'; // ユーティリティ関数
import { toJapaneseDate, toShortJapaneseDate } from '../../utils/dateUtils'; // 日付フォーマット関数
import { formatCurrency } from '../../utils/formatters'; // 通貨フォーマット関数

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

// ツールチップアイコンコンポーネント
const TooltipIcon = ({ content }) => (
    <div className="group relative inline-block ml-2">
        <HelpCircle className="h-4 w-4 text-gray-300 hover:text-gray-100 cursor-help transition-colors" />
        <div className="invisible group-hover:visible absolute z-20 w-64 p-2 mt-2 text-sm text-gray-200 bg-gray-900 rounded-lg shadow-lg -translate-x-1/2 left-1/2">
            <p>{content}</p>
        </div>
    </div>
);

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
    if (!payload) return null;
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

// カスタムツールチップコンポーネント
const ChartTooltip = ({ active, payload, label, exchangeRate }) => {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    return (
        <div className="bg-gray-900 text-white rounded-md shadow-lg p-3">
            <p className="text-sm font-bold border-b border-gray-700 mb-2 pb-1">
                {toJapaneseDate(label)}
            </p>
            {payload.map((entry, index) => {
                if (!entry.value) return null;

                const realValue = entry.dataKey === 'price' ||
                    entry.dataKey === 'medianModel' ||
                    entry.dataKey === 'supportModel'
                    ? fromLog10(entry.value)
                    : entry.value;

                const jpyValue = realValue * exchangeRate;

                const nameMap = {
                    price: '実際価格',
                    medianModel: '中央価格',
                    supportModel: '下限価格',
                };
                const displayName = nameMap[entry.dataKey] || entry.name;

                return (
                    <p key={index} className="text-xs flex justify-between" style={{ color: entry.color }}>
                        <span>{displayName}:</span>
                        <span>{formatCurrency(realValue, 'USD')} ({formatCurrency(jpyValue, 'JPY')})</span>
                    </p>
                );
            })}
        </div>
    );
};


// メインコンポーネント (BitcoinPowerLawChart)
const BitcoinPowerLawChart = React.memo(({ exchangeRate = 150 }) => {
    const chartData = useBitcoinChartData(exchangeRate); // カスタムフックからデータを取得

    const [selectedRange, setSelectedRange] = useState('all'); // 選択された期間 (デフォルトは 'all')
    const [displayedDateRange, setDisplayedDateRange] = useState({ startIndex: 0, endIndex: 0 }); // 表示するデータの範囲

    // データ更新関数
    const refreshData = useCallback(() => {
        chartData.fetchData && chartData.fetchData();
    }, [chartData]);



    // 期間変更ハンドラー
    const handleRangeChange = useCallback((range) => {
        setSelectedRange(range);
    }, []);

    // 表示範囲計算関数
    const calculateDateRange = useCallback((data, range) => {
        if (!data || data.length === 0) return { startIndex: 0, endIndex: 0 };

        const endIndex = data.length - 1;
        let startIndex = 0;
        const today = new Date(); // 今日の日付

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

    // 半減期エリアの計算
    const halvingReferenceAreas = useMemo(() => {
        if (!displayedData || displayedData.length === 0) return [];

        return BITCOIN_EVENTS
            // 現在の表示範囲に含まれる半減期イベントのみをフィルタリング
            .filter(event => {
                const eventDate = event.date;
                return displayedData.some(item => item.date === eventDate ||
                    (displayedData[0].date <= eventDate && eventDate <= displayedData[displayedData.length - 1].date));
            })
            // 各半減期イベントに対して、ReferenceArea 用のデータを作成
            .map(event => {
                const eventIndex = displayedData.findIndex(item => item.date === event.date);
                if (eventIndex === -1) return null; // データが見つからない場合はnullを返す

                const totalDays = displayedData.length;
                const width = Math.max(1, Math.min(7, Math.ceil(totalDays / 100))); // 幅を計算 (最小1, 最大7)

                const start = Math.max(0, eventIndex - width); // 開始インデックス
                const end = Math.min(displayedData.length - 1, eventIndex + width);   // 終了インデックス

                return {
                    event,
                    startDate: displayedData[start].date,
                    endDate: displayedData[end].date
                };
            })
            .filter(Boolean); // null の要素を取り除く
    }, [displayedData]);


    // CSVダウンロード関数
    const downloadCSV = useCallback(() => {
        if (!chartData.data || chartData.data.length === 0) return;

        const headers = ['Date', 'Price', 'MedianModel', 'SupportModel'];

        const csvRows = [
            headers.join(','),
            ...chartData.data.map(item => {
                const price = item.price ? fromLog10(item.price).toFixed(2) : "";
                const median = item.medianModel ? fromLog10(item.medianModel).toFixed(2) : "";
                const support = item.supportModel ? fromLog10(item.supportModel).toFixed(2) : "";

                return [
                    item.date,
                    price,
                    median,
                    support
                ].join(',');
            })
        ];

        const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'bitcoin_powerlaw_data.csv');
        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
    }, [chartData.data]); // 依存配列を修正


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
                <h2 className="text-xl font-bold text-gray-100 flex items-center">
                    ビットコインパワーローチャート
                    <TooltipIcon content="ビットコインの価格成長は時間の累乗関数（パワーロー）に従う傾向があります。このチャートは価格と理論的な価格範囲を示します。" />
                </h2>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* 日付範囲セレクター */}
                    <DateRangeSelector
                        selectedRange={selectedRange}
                        onRangeChange={handleRangeChange}
                    />

                    <div className="flex gap-2">
                        {/* 更新ボタン */}
                        <button
                            onClick={refreshData}
                            className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
                            disabled={chartData.loading} //ローディング中は更新ボタンを無効化
                        >
                            <RefreshCw className={`h-4 w-4 mr-1 ${chartData.loading ? 'animate-spin' : ''}`} />
                            更新
                        </button>

                        {/* CSVダウンロードボタン */}
                        <button
                            onClick={downloadCSV}
                            className="flex items-center px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm transition-colors"
                            disabled={!chartData.data} // データがない場合はダウンロードボタンを無効化
                        >
                            <Download className="h-4 w-4 mr-1" />
                            CSV
                        </button>
                    </div>
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
                                            return new Date(date).getFullYear().toString(); // 年のみ表示
                                        } else if (totalDays > 365) {
                                            return toShortJapaneseDate(date); // 年/月 表示
                                        }
                                        return toJapaneseDate(date); // YYYY年MM月DD日 表示
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
                                        return formatCurrency(value, 'USD').replace(/[\$,]/g, ''); // 通貨フォーマット
                                    }}
                                    tick={{ fontSize: 11 }}
                                />

                                {/* ツールチップ */}
                                <Tooltip
                                    content={
                                        <ChartTooltip
                                            exchangeRate={exchangeRate}
                                            latestPrice={chartData.latestPrice}
                                        />
                                    }
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
                                    strokeDasharray="5 5" // 破線
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
                                    dot={false}
                                    activeDot={{ r: 6 }} // アクティブなドットを大きく
                                    name="実際価格"
                                    connectNulls={true} // データがない点を線でつなぐ
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

                            </LineChart>
                        </ResponsiveContainer>

                        {/* 凡例 */}
                        <Legend
                            content={<CustomLegend />}
                            verticalAlign="top"
                            align="right"
                            wrapperStyle={{ top: 0, right: 10 }}
                        />
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
                    </div>
                </>
            )}
        </div>
    );
});

export default BitcoinPowerLawChart;