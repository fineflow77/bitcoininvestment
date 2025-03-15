import React from 'react';
import { useBitcoinData } from '../../hooks/useBitcoinData';
import { formatCurrency } from '../../utils/formatters';
import DataContainer from '../ui/DataContainer';

interface BitcoinDataDisplayProps {
    className?: string;
}

const BitcoinDataDisplay: React.FC<BitcoinDataDisplayProps> = ({ className = '' }) => {
    const { loading, error, currentPrice, dataSources } = useBitcoinData();

    return (
        <DataContainer
            isLoading={loading}
            error={error}
            loadingMessage="ビットコイン価格データを取得中..."
            className={className}
        >
            <div className="bg-btc-surface p-4 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                    <h2 className="text-lg font-semibold text-btc-text">ビットコイン現在価格</h2>
                    <div className="text-xs text-btc-text-soft mt-1 sm:mt-0">
                        データソース: {dataSources.currentPrice || 'Unknown'}
                    </div>
                </div>

                {currentPrice && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                            <span className="text-btc-text-soft">USD価格:</span>
                            <span className="text-btc-accent text-xl font-medium">
                                {formatCurrency(currentPrice.prices.usd, 'USD')}
                            </span>
                        </div>

                        <div className="flex justify-between items-baseline">
                            <span className="text-btc-text-soft">JPY価格:</span>
                            <span className="text-btc-accent text-2xl font-semibold">
                                {formatCurrency(currentPrice.prices.jpy, 'JPY')}
                            </span>
                        </div>

                        <div className="flex justify-between items-baseline">
                            <span className="text-btc-text-soft">為替レート:</span>
                            <span className="text-btc-text text-sm">
                                ¥{currentPrice.prices.exchangeRate.toFixed(2)}
                            </span>
                        </div>

                        <div className="text-right text-xs text-btc-text-soft mt-2">
                            最終更新: {new Date(currentPrice.timestamp).toLocaleTimeString('ja-JP')}
                        </div>
                    </div>
                )}
            </div>
        </DataContainer>
    );
};

export default BitcoinDataDisplay;