import React from 'react';
import { fromLog10 } from '../../utils/mathUtils';
import { formatCurrency } from '../../utils/formatters';
import { toJapaneseDate } from '../../utils/dateUtils';

// ツールチップコンポーネント
const ChartTooltip = ({ active, payload, label, exchangeRate = 150 }) => {
    if (!active || !payload || !payload.length) {
        return null;
    }

    // ペイロードから各データを取得
    const data = payload.reduce((acc, entry) => {
        if (entry.dataKey && entry.value !== undefined) {
            // ログスケールから実際の値に変換
            acc[entry.dataKey] = fromLog10(entry.value);
        }
        return acc;
    }, {});

    // originalPrice がペイロードに含まれているかチェック
    const originalPrice = payload.find(p => p.payload && p.payload.originalPrice !== undefined)?.payload.originalPrice;

    // 実際の価格（price または originalPrice）
    const actualPrice = data.price || originalPrice;

    // チャートの日付
    const date = label ? toJapaneseDate(label) : '';

    return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-md shadow-lg">
            <p className="text-gray-300 font-semibold mb-2">{date}</p>

            {actualPrice !== undefined && (
                <div className="flex justify-between items-center mb-1">
                    <span className="text-amber-500 mr-4">実際価格:</span>
                    <span className="text-white font-semibold">
                        {formatCurrency(Math.round(actualPrice), 'USD')}
                        <span className="text-gray-400 text-sm ml-1">
                            ({formatCurrency(Math.round(actualPrice * exchangeRate), 'JPY')})
                        </span>
                    </span>
                </div>
            )}

            {data.medianModel !== undefined && (
                <div className="flex justify-between items-center mb-1">
                    <span className="text-green-500 mr-4">中央価格:</span>
                    <span className="text-white">
                        {formatCurrency(Math.round(data.medianModel), 'USD')}
                        <span className="text-gray-400 text-sm ml-1">
                            ({formatCurrency(Math.round(data.medianModel * exchangeRate), 'JPY')})
                        </span>
                    </span>
                </div>
            )}

            {data.supportModel !== undefined && (
                <div className="flex justify-between items-center">
                    <span className="text-red-500 mr-4">下限価格:</span>
                    <span className="text-white">
                        {formatCurrency(Math.round(data.supportModel), 'USD')}
                        <span className="text-gray-400 text-sm ml-1">
                            ({formatCurrency(Math.round(data.supportModel * exchangeRate), 'JPY')})
                        </span>
                    </span>
                </div>
            )}

            {/* パワーロー比率計算 - 実際価格と中央価格の両方が存在する場合のみ表示 */}
            {actualPrice !== undefined && data.medianModel !== undefined && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                        <span className="text-blue-400 mr-4">パワーロー比:</span>
                        <span className={`font-semibold ${(actualPrice / data.medianModel - 1) * 100 > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {((actualPrice / data.medianModel - 1) * 100).toFixed(1)}%
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChartTooltip;