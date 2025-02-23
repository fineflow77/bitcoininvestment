import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBitcoinPrice } from '../hooks/useBitcoinPrice';
import { formatCurrency } from '../utils/formatters';
import BitcoinPowerLawChart from '../components/simulators/BitcoinPowerLawChart';
import { differenceInDays } from 'date-fns';

// ビットコインの起源日（2009-01-03）
const BITCOIN_GENESIS_DATE = new Date(2009, 0, 3);

/**
 * 今日が2009年1月3日から何日経過したかを取得
 * @returns {number} - 日数
 */
const getDaysSinceGenesis = () => differenceInDays(new Date(), BITCOIN_GENESIS_DATE);

const Home = () => {
  const { price, loading, error } = useBitcoinPrice();
  const [exchangeRate, setExchangeRate] = useState(150);
  const [powerLawPrice, setPowerLawPrice] = useState({ usd: 0, jpy: 0 });
  const [bottomPrice, setBottomPrice] = useState({ usd: 0, jpy: 0 });
  const [deviation, setDeviation] = useState(0);

  useEffect(() => {
    if (price?.prices) {
      const daysSinceGenesis = getDaysSinceGenesis();

      // 中央値モデル
      const medianUSD = Math.pow(10, -17.01593313 + 5.84509376 * Math.log10(daysSinceGenesis));
      const medianJPY = medianUSD * exchangeRate;

      // サポートモデル（下限値）
      const supportUSD = Math.pow(10, -17.668) * Math.pow(daysSinceGenesis, 5.926);
      const supportJPY = supportUSD * exchangeRate;

      // ステート更新
      setPowerLawPrice({ usd: medianUSD, jpy: medianJPY });
      setBottomPrice({ usd: supportUSD, jpy: supportJPY });

      if (price.prices.usd) {
        const dev = ((price.prices.usd / medianUSD) - 1) * 100;
        setDeviation(dev);
      }
    }
  }, [price, exchangeRate]);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* 価格分析セクション */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">本日のビットコイン価格概要</h2>

          <div className="text-gray-400 text-sm mb-4">
            USD/JPY: ¥{exchangeRate.toFixed(2)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 現在価格 */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 mb-2">現在価格</p>
              {loading ? (
                <p className="text-2xl text-white">読込中...</p>
              ) : error ? (
                <p className="text-red-500">エラー</p>
              ) : (
                <>
                  <p className="text-2xl text-white">
                    {formatCurrency(price?.prices?.jpy)}
                  </p>
                  <p className="text-gray-400 text-sm">
                    (${price?.prices?.usd.toLocaleString()})
                  </p>
                  <p className={`text-sm mt-2 ${deviation > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    パワーロー比 {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%
                  </p>
                </>
              )}
            </div>

            {/* 中央値モデル */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 mb-2">本日のパワーロー中央値</p>
              <p className="text-2xl text-white">
                {formatCurrency(powerLawPrice.jpy)}
              </p>
              <p className="text-gray-400 text-sm">
                (${powerLawPrice.usd.toLocaleString()})
              </p>
            </div>

            {/* 下限値モデル */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 mb-2">本日のパワーロー下限値</p>
              <p className="text-2xl text-white">
                {formatCurrency(bottomPrice.jpy)}
              </p>
              <p className="text-gray-400 text-sm">
                (${bottomPrice.usd.toLocaleString()})
              </p>
            </div>
          </div>
        </div>

        {/* パワーローチャート */}
        <div className="mb-8">
          <BitcoinPowerLawChart />
        </div>

        {/* シミュレーターリンク */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/simulator?type=withdrawal"
            className="bg-blue-600 hover:bg-blue-700 rounded-lg p-6 text-center"
          >
            <h3 className="text-xl font-bold text-white mb-2">
              取り崩しシミュレーター
            </h3>
            <p className="text-gray-200">
              保有するビットコインの取り崩し計画（FIRE計画）を立てる
            </p>
          </Link>

          <Link
            to="/simulator?type=investment"
            className="bg-green-600 hover:bg-green-700 rounded-lg p-6 text-center"
          >
            <h3 className="text-xl font-bold text-white mb-2">
              積み立てシミュレーター
            </h3>
            <p className="text-gray-200">
              目標ビットコイン保有数へ向けて積み立てプランを立てる
            </p>
          </Link>
        </div>

        {/* パワーロー解説 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">パワーローモデルとは</h2>
          <p className="text-gray-300 mb-4">
            物理法則に基づく、ビットコインの長期価格予測モデル。過去の価格推移から、時間経過と価格の関係を数学的に分析し、
            将来の価格帯を予測します。長期投資の指標として活用できます。
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