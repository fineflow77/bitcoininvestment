import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Brush, ReferenceArea, Label, ReferenceLine, Text
} from 'recharts';
import { Calendar } from 'lucide-react'; // 使っているアイコンだけに絞る
import { useBitcoinChartData } from '../../hooks/useBitcoinChartData';
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

// レンダリング定数
const CHART_CONFIG = {
    ANIMATION_DURATION: 0,    // アニメーション時間
    PRICE_LINE_WIDTH: 0.7,    // 実際価格の線の太さ (px)
    MODEL_LINE_WIDTH: 1.5,    // モデル線の太さ (px)
};

// ビットコインの半減期イベント
const BITCOIN_EVENTS = [
    { date: '2012-11-28', label: '第1回', description: '報酬が25BTCに半減' },
    { date: '2016-07-09', label: '第2回', description: '報酬が12.5BTCに半減' },
    { date: '2020-05-11', label: '第3回', description: '報酬が6.25BTCに半減' },
    { date: '2024-04-20', label: '第4回', description: '報酬が3.125BTCに半減' },
];

// 日付範囲セレクターコンポーネント
const DateRangeSelector = React.memo(({ selectedRange, onRangeChange }) => (
    <div className="flex items-center w-full">
        <Calendar className="h-4 w-4 mr-2 text-gray-300" />
        <div className="flex flex-wrap sm:flex-nowrap bg-gray-800 rounded-md overflow-hidden w-full">
            {['all', '10y', '5y', '2y', '1y', '6m'].map(range => (
                <button
                    key={range}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm transition-colors flex-1 ${selectedRange === range ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-300 hover:bg-gray-700'}`}
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
));

// カスタム凡例コンポーネント
const CustomLegend = React.memo(({ payload }) => {
    if (!payload || !payload.length) {
        return null; // 凡例データがない場合は何も表示しない
    }

    const labelMap = {
        price: '実際価格',
        medianModel: '中央価格',
        supportModel: '下限価格',
    };

    // payload を順番通りに並べ替え
    const orderedPayload = ['price', 'medianModel', 'supportModel']
        .map(key => payload.find(item => item.dataKey === key))
        .filter(Boolean); // undefined を除去

    return (
        <div className="flex gap-2 sm:gap-6 justify-end flex-wrap">
            {orderedPayload.map((entry, index) => (
                <div key={index} className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-gray-200 text-xs sm:text-sm">{labelMap[entry.dataKey] || entry.dataKey}</span>
                </div>
            ))}
        </div>
    );
});

// カスタム決定係数コンポーネント
const RSquaredDisplay = React.memo(({ rSquared }) => {
    if (rSquared === null || rSquared === undefined) return null;

    return (
        <div className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-75 px-2 py-1 rounded text-gray-300 text-xs">
            決定係数 (R²): {rSquared.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
        </div>
    );
});

// メインコンポーネント (BitcoinPowerLawChart)
const BitcoinPowerLawChart = React.memo(({ exchangeRate = 150 }) => {
    const chartData = useBitcoinChartData(exchangeRate);

    const [selectedRange, setSelectedRange] = useState('all');
    const [displayedDateRange, setDisplayedDateRange] = useState({ startIndex: 0, endIndex: 0 });

    // 期間変更ハンドラー - 依存関係のない安定したコールバック
    const handleRangeChange = useCallback((range) => {
        setSelectedRange(range);
    }, []); // 空の依存配列 - コンポーネントの再レンダリング時に再作成されない

    // 表示範囲計算関数 - メモ化して安定した参照を保持
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
    }, []); // 空の依存配列

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

    // 半減期エリアの計算 - メモ化して不要な再計算を防止
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
        <div className="bg-gray-900 rounded-lg p-2 sm:p-4 shadow-lg text-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 sm:mb-4 gap-2 sm:gap-3">
                <div className="w-full flex flex-col sm:flex-row gap-2 sm:gap-3">
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
                    <div className="mb-2 sm:mb-4 text-xs text-gray-400 text-right">
                        <span>最終更新: {chartData.lastUpdated}</span>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-0 sm:p-2 relative">
                        {/* 決定係数を表示 - 左の目盛りの上に配置 */}
                        <div className="absolute top-2 left-2 bg-gray-800 bg-opacity-75 px-2 py-1 rounded text-gray-300 text-xs z-10">
                            決定係数 (R²): {chartData.rSquared !== null && chartData.rSquared !== undefined ?
                                chartData.rSquared.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : '-'}
                        </div>

                        <ResponsiveContainer width="100%" height={550}>
                            <LineChart
                                data={displayedData}
                                margin={{
                                    top: 20,
                                    right: 20,
                                    left: 0, // 左マージンを削減して横幅いっぱいに表示 
                                    bottom: 20
                                }}
                                animationDuration={CHART_CONFIG.ANIMATION_DURATION}
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
                                        const isMobile = window.innerWidth < 640; // スマホビューかどうか

                                        // 表示期間とデバイスに応じて日付フォーマットを調整
                                        if (isMobile) {
                                            // モバイル表示ではより簡略化
                                            if (totalDays > 365 * 2) {
                                                return new Date(date).getFullYear().toString().slice(2); // 末尾2桁の年だけを表示
                                            } else {
                                                return toShortJapaneseDate(date).replace(/月/g, '/').replace(/日/g, '');
                                            }
                                        } else {
                                            // PC表示では通常フォーマット
                                            if (totalDays > 365 * 4) {
                                                return new Date(date).getFullYear().toString();
                                            } else if (totalDays > 365) {
                                                return toShortJapaneseDate(date);
                                            }
                                            return toJapaneseDate(date);
                                        }
                                    }}
                                    tick={{ fontSize: 10 }}
                                    minTickGap={20} // モバイル用に間隔を少し狭く
                                    height={30} // 高さを固定して一貫したスペースを確保
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
                                    width={45} // 固定幅を設定して一貫したスペースを確保
                                />

                                {/* ツールチップ */}
                                <Tooltip
                                    content={<ChartTooltip exchangeRate={exchangeRate} />}
                                    cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                                />

                                {/* 他のライン（中央価格、下限価格）を先に描画 */}
                                {/* 中央価格ライン */}
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="medianModel"
                                    stroke={COLORS.median}
                                    strokeWidth={CHART_CONFIG.MODEL_LINE_WIDTH}
                                    dot={false}
                                    name="中央価格"
                                    strokeDasharray="5 5"
                                    isAnimationActive={false}
                                    animationDuration={CHART_CONFIG.ANIMATION_DURATION}
                                />

                                {/* 下限価格ライン */}
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="supportModel"
                                    stroke={COLORS.support}
                                    strokeWidth={CHART_CONFIG.MODEL_LINE_WIDTH}
                                    dot={false}
                                    name="下限価格"
                                    isAnimationActive={false}
                                    animationDuration={CHART_CONFIG.ANIMATION_DURATION}
                                />

                                {/* 実際価格ライン - 特殊なレンダリング設定 */}
                                <Line
                                    yAxisId="left"
                                    type="linear" // monotoneからlinearへ変更
                                    dataKey="price"
                                    stroke={COLORS.price}
                                    strokeWidth={CHART_CONFIG.PRICE_LINE_WIDTH} // 線の太さをさらに細く
                                    dot={false} // ドットを完全に無効化
                                    activeDot={{ r: 4, strokeWidth: 1 }} // アクティブドットの設定を細かく調整
                                    name="実際価格"
                                    connectNulls={true} // 欠損値があってもラインをつなぐ
                                    isAnimationActive={false} // アニメーションを無効化
                                    animationDuration={CHART_CONFIG.ANIMATION_DURATION}
                                    style={{
                                        strokeLinecap: 'butt',
                                        strokeLinejoin: 'miter',
                                        vectorEffect: 'non-scaling-stroke' // 重要: SVGの拡大縮小時に線の太さを一定に保つ
                                    }}
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
                                        <Line
                                            dataKey="price"
                                            stroke={COLORS.price}
                                            dot={false}
                                            strokeWidth={CHART_CONFIG.PRICE_LINE_WIDTH}
                                            isAnimationActive={false}
                                            animationDuration={CHART_CONFIG.ANIMATION_DURATION}
                                            style={{ vectorEffect: 'non-scaling-stroke' }}
                                        />
                                    </LineChart>
                                </Brush>

                                {/* 凡例 */}
                                <Legend
                                    content={<CustomLegend />}
                                    verticalAlign="top"
                                    align="right"
                                    wrapperStyle={{ top: 5, right: 10 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 説明文 */}
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm sm:text-base text-gray-400">
                        <div className="bg-gray-800 rounded-md p-3">
                            <h4 className="font-semibold mb-1 text-gray-300">パワーローモデルについて</h4>
                            <p className="text-sm sm:text-base">ビットコインの価格成長は時間の累乗関数（パワーロー）に従う傾向があります。中央価格はビットコイン価格が最も滞在しやすい中心的な価格帯を表し、下限価格は過去のビットコイン価格が歴史的に下回ったことがない最低水準を示します。</p>
                            <p className="mt-2">
                                <a href="/powerlaw" className="text-blue-400 hover:text-blue-300 transition-colors underline">
                                    パワーローモデルの詳細ページ
                                </a>
                            </p>
                        </div>

                        <div className="bg-gray-800 rounded-md p-3">
                            <h4 className="font-semibold mb-1 text-gray-300">注意事項</h4>
                            <p className="text-sm sm:text-base">このモデルは価格予測や投資アドバイスではありません。歴史的なトレンドの視覚化のみを目的としています。</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
});

export default BitcoinPowerLawChart;