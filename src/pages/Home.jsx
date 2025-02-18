import React from 'react';
import { Link } from 'react-router-dom';
import { useBitcoinPrice } from '../hooks/useBitcoinPrice';
import { STANDARD_PRICE_MODEL } from '../constants/priceModels';

const Home = () => {
  const { price, loading, error } = useBitcoinPrice();

  // 本日の予測価格（パワーローモデル）
  const powerLawPrice2025 = STANDARD_PRICE_MODEL[2025];
  const bottomPrice2025 = powerLawPrice2025 * 0.637; // -1σ (e^-0.45)

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* 現在価格とパワーロー比較 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Bitcoin価格分析</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 現在価格 */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 mb-2">現在価格</p>
              {loading ? (
                <p className="text-2xl text-white">読込中...</p>
              ) : error ? (
                <p className="text-red-500">エラー</p>
              ) : (
                <p className="text-2xl text-white">
                  ¥{price?.jpy.toLocaleString()}
                </p>
              )}
            </div>

            {/* 本日のパワーロー推定価格 */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 mb-2">パワーロー予測(本日)</p>
              <p className="text-2xl text-white">
                ¥{(powerLawPrice2025 * 150).toLocaleString()}
              </p>
            </div>

            {/* ボトムライン */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 mb-2">ボトムライン(-1σ)</p>
              <p className="text-2xl text-white">
                ¥{(bottomPrice2025 * 150).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* シミュレーターリンク */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/simulator?type=withdrawal"
            className="bg-blue-600 hover:bg-blue-700 rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              取り崩しシミュレーター
            </h3>
            <p className="text-gray-200">
              保有するビットコインの取り崩し計画を立てる
            </p>
          </Link>

          <Link to="/simulator?type=investment"
            className="bg-green-600 hover:bg-green-700 rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              積み立てシミュレーター
            </h3>
            <p className="text-gray-200">
              目標金額達成のための積み立てプランを立てる
            </p>
          </Link>
        </div>

        {/* パワーロー解説 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">パワーローモデルとは</h2>
          <p className="text-gray-300 mb-4">
            ビットコインの長期価格予測モデル。過去の価格推移から、供給量と価格の関係を数学的に分析し、
            将来の価格帯を予測します。このモデルは長期投資の指標として活用されています。
          </p>
          <Link to="/powerlaw" className="text-blue-400 hover:text-blue-300">
            詳しく見る →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
