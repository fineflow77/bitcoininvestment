import React from 'react';
import { useBitcoinPrice } from '../hooks/useBitcoinPrice';
import { compareToPowerLaw } from '../utils/powerLaw';
import { formatCurrency, formatPercent } from '../utils/formatters';

const PriceBenchmark = () => {
  const { price, loading, error } = useBitcoinPrice();

  if (loading) return <div className="text-gray-400">価格データ読み込み中...</div>;
  if (error) return <div className="text-red-500">価格データの取得に失敗しました</div>;
  
  if (!price) return null;

  const comparison = compareToPowerLaw(price.usd);
  
  return (
    <div className="bg-gray-700 p-4 rounded-lg mb-6">
      <h2 className="text-xl mb-4">現在価格とパワーロー比較</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <p className="text-gray-400">現在価格</p>
          <p className="text-2xl">{formatCurrency(price.jpy)}</p>
        </div>
        <div>
          <p className="text-gray-400">パワーロー予測</p>
          <p className="text-2xl">{formatCurrency(comparison.powerLawPrice * 150)}</p>
        </div>
        <div>
          <p className="text-gray-400">ボトムライン (-1σ)</p>
          <p className="text-2xl">{formatCurrency(comparison.bottomPrice * 150)}</p>
        </div>
        <div>
          <p className="text-gray-400">乖離率</p>
          <p className={`text-2xl ${comparison.deviation >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatPercent(comparison.deviation)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriceBenchmark;
