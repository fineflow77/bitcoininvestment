import React, { useState, useEffect } from 'react';
import { differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';
import BitcoinPowerLawChart from '../components/simulators/BitcoinPowerLawChart';
import useBitcoinChartData from '../hooks/useBitcoinChartData';
import { formatCurrency } from '../utils/formatters';
import { useExchangeRate } from '../hooks/useExchangeRate';
// import { calculatePowerLawPosition, getPowerLawPositionLabel, getPowerLawPositionColor } from '../utils/mathUtils'; // 使わないので削除



const BITCOIN_GENESIS_DATE = new Date(2009, 0, 3);
const getDaysSinceGenesis = () => differenceInDays(new Date(), BITCOIN_GENESIS_DATE);

const Home = () => {
  const exchangeRateData = useExchangeRate();
  const chartData = useBitcoinChartData(exchangeRateData.exchangeRate);
  const [buyRecommendation, setBuyRecommendation] = useState(false);


  useEffect(() => {
    if (!chartData.loading && !chartData.error && chartData.data) {
      const daysSinceGenesis = getDaysSinceGenesis();
      const medianUSD = Math.pow(10, -17.01593313 + 5.84509376 * Math.log10(daysSinceGenesis));
      const supportUSD = Math.pow(10, -17.668) * Math.pow(daysSinceGenesis, 5.926);
      const supportJPY = Math.round(supportUSD * exchangeRateData.exchangeRate);
      const currentJPY = chartData.latestPrice * exchangeRateData.exchangeRate;
      const threshold = 10;
      const deviationFromSupport = ((currentJPY / supportJPY) - 1) * 100;

      setBuyRecommendation(deviationFromSupport <= threshold && deviationFromSupport >= -threshold);
    }
  }, [chartData, exchangeRateData.exchangeRate]);

  const priceChangePercentage = chartData.previousPrice.usd && chartData.latestPrice
    ? Math.round(((chartData.latestPrice - chartData.previousPrice.usd) / chartData.previousPrice.usd) * 1000) / 10
    : 0;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-300 mb-6 text-center">ビットコイン価格トラッカー</h1>

          <div className="flex items-center text-gray-400 text-sm mb-4">
            <span>USD/JPY: ¥{exchangeRateData.loading ? '読み込み中...' : exchangeRateData.error ? '150.00 (デフォルト)' : exchangeRateData.exchangeRate.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-gray-700 p-4 rounded-lg hover:shadow-lg transition-shadow">
              <p className="text-gray-400 mb-2 flex items-center">現在価格</p>
              {chartData.loading ? (
                <div className="animate-pulse h-8 bg-gray-600 rounded w-3/4"></div>
              ) : chartData.error ? (
                <p className="text-red-400">エラー: {chartData.error}</p>
              ) : chartData.data ? (
                <>
                  <p className="text-amber-500 text-2xl font-semibold">
                    {formatCurrency(Math.round(chartData.latestPrice * exchangeRateData.exchangeRate), 'JPY')}
                  </p>
                  <p className="text-gray-400 text-sm">({formatCurrency(Math.round(chartData.latestPrice), 'USD')})</p>
                  <p className={`text-lg font-semibold mt-2 ${priceChangePercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    前日比 {priceChangePercentage >= 0 ? '+' : ''}{priceChangePercentage}%
                  </p>
                  {/* パワーロー比 (修正) */}
                  {(() => {
                    const daysSinceGenesis = getDaysSinceGenesis();
                    const medianUSD = Math.pow(10, -17.01593313 + 5.84509376 * Math.log10(daysSinceGenesis));

                    let powerLawRatio = null; // 初期値を null に
                    if (chartData.latestPrice !== undefined && chartData.latestPrice !== null && medianUSD !== 0) {
                      powerLawRatio = ((chartData.latestPrice / medianUSD) - 1) * 100;
                    }

                    return (
                      <p className={`text-lg font-semibold mt-2 ${powerLawRatio !== null && powerLawRatio > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        パワーロー比 {powerLawRatio !== null && typeof powerLawRatio === 'number'
                          ? (powerLawRatio > 0 ? '+' : '') + powerLawRatio.toFixed(1) + '%'
                          : '-'}
                      </p>
                    )
                  })()}
                </>
              ) : (
                <p className="text-gray-400">価格情報なし</p>
              )}
            </div>

            <div className="bg-gray-700 p-4 rounded-lg hover:shadow-lg transition-shadow">
              <p className="text-gray-400 mb-2 flex items-center">
                本日のパワーロー中央価格

              </p>
              {chartData.loading ? (
                <div className="animate-pulse h-8 bg-gray-600 rounded w-1/2"></div>
              ) : (
                <>
                  <p className="text-gray-200 text-2xl">{formatCurrency(Math.round(Math.pow(10, -17.01593313 + 5.84509376 * Math.log10(getDaysSinceGenesis())) * exchangeRateData.exchangeRate), 'JPY')}</p>
                  <p className="text-gray-400 text-sm">({formatCurrency(Math.round(Math.pow(10, -17.01593313 + 5.84509376 * Math.log10(getDaysSinceGenesis()))), 'USD')})</p>
                </>
              )}
            </div>

            <div className="bg-gray-700 p-4 rounded-lg hover:shadow-lg transition-shadow">
              <p className="text-gray-400 mb-2 flex items-center">
                本日のパワーロー下限価格

              </p>
              <>
                <p className="text-gray-200 text-2xl">{formatCurrency(Math.round(Math.pow(10, -17.668) * Math.pow(getDaysSinceGenesis(), 5.926) * exchangeRateData.exchangeRate), 'JPY')}</p>
                <p className="text-gray-400 text-sm">(${(Math.round(Math.pow(10, -17.668) * Math.pow(getDaysSinceGenesis(), 5.926))).toLocaleString()})</p>
              </>
            </div>
          </div>
        </div>

        {buyRecommendation && !chartData.loading && !chartData.error && (
          <div className="bg-green-600 p-4 rounded-lg text-center text-white mb-4">
            買い推奨: 実際価格がパワーロー下限価格に近づきました！
          </div>
        )}

        <div className="bg-gray-700 p-4 rounded-lg mb-8 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">長期パワーロー チャート（週次＋日次）</h2>
          <BitcoinPowerLawChart exchangeRate={exchangeRateData.exchangeRate} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Link to="/simulator?type=withdrawal" className="w-full bg-blue-500 p-4 rounded-lg text-center hover:bg-blue-600 hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200">
            <h3 className="text-xl font-bold text-gray-300 mb-2">取り崩しシミュレーター</h3>
            <p className="text-gray-200">保有するビットコインの取り崩し計画を立てる</p>
          </Link>

          <Link to="/simulator?type=investment" className="w-full bg-green-500 p-4 rounded-lg text-center hover:bg-green-600 hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200">
            <h3 className="text-xl font-bold text-gray-300 mb-2">積み立てシミュレーター</h3>
            <p className="text-gray-200">目標ビットコイン保有数へ向けた計画を立てる</p>
          </Link>
        </div>

        <footer className="text-center text-gray-400 mt-8 py-4 border-t border-gray-800">
          <p>
            © {new Date().getFullYear()} BTCパワーロー博士{' '}
            <a href="https://x.com/lovewaves711" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
              @lovewaves711
            </a>
            . All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;