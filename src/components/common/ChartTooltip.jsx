// src/components/common/ChartTooltip.jsx
import React from 'react';
import { fromLog10 } from '../../utils/mathUtils'; // 必要
import { toJapaneseDate } from '../../utils/dateUtils';  //必要
import { formatCurrency } from '../../utils/formatters'; // 必要

const ChartTooltip = ({ active, payload, label, exchangeRate }) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;

        // 各データの値を準備 (存在しない場合は "-" を表示)
        const priceValue = dataPoint?.price !== undefined ? fromLog10(dataPoint.price) : null;
        const medianValue = dataPoint?.medianModel !== undefined ? fromLog10(dataPoint.medianModel) : null;
        const supportValue = dataPoint?.supportModel !== undefined ? fromLog10(dataPoint.supportModel) : null;

        return (
            <div className="bg-gray-900 text-white rounded-md shadow-lg p-3">
                <p className="text-sm font-bold border-b border-gray-700 mb-2 pb-1">
                    {toJapaneseDate(label)}
                </p>
                {/* 実際価格 */}
                {priceValue !== null && (
                    <p className="text-xs flex justify-between" style={{ color: '#F7931A' }}>
                        <span>実際価格:</span>
                        <span>
                            {`${formatCurrency(priceValue, 'USD')} (${formatCurrency(priceValue * exchangeRate, 'JPY')})`}
                        </span>
                    </p>
                )}
                {/* 中央価格 */}
                <p className="text-xs flex justify-between" style={{ color: '#4CAF50' }}>
                    <span>中央価格:</span>
                    <span>
                        {medianValue !== null
                            ? `${formatCurrency(medianValue, 'USD')} (${formatCurrency(medianValue * exchangeRate, 'JPY')})`
                            : '-'}
                    </span>
                </p>
                {/* 下限価格 */}
                <p className="text-xs flex justify-between" style={{ color: '#FF5252' }}>
                    <span>下限価格:</span>
                    <span>
                        {supportValue !== null
                            ? `${formatCurrency(supportValue, 'USD')} (${formatCurrency(supportValue * exchangeRate, 'JPY')})`
                            : '-'}
                    </span>
                </p>
            </div>
        );
    }

    return null;
};

export default ChartTooltip;