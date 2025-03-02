import React, { useState, useEffect } from 'react';
import { differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';
import BitcoinPowerLawChart from '../components/simulators/BitcoinPowerLawChart';
import useBitcoinChartData from '../hooks/useBitcoinChartData';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { useExchangeRate } from '../hooks/useExchangeRate';
// TooltipIcon, calculatePowerLawPosition, getPowerLawPositionLabel, getPowerLawPositionColor は削除

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

  const priceChangePercentage = chartData.previousPrice?.usd && chartData.latestPrice
    ? ((chartData.latestPrice - chartData.previousPrice.usd) / chartData.previousPrice.usd) * 100
    : null;

  let powerLawRatio = null;
  if (chartData.latestPrice !== undefined && chartData.latestPrice !== null) {
    const daysSinceGenesis = getDaysSinceGenesis();
    const medianUSD = Math.pow(10, -17.01593313 + 5.84509376 * Math.log10(daysSinceGenesis));
    if (medianUSD !== 0) {
      powerLawRatio = ((chartData.latestPrice / medianUSD) - 1) * 100;
    }
  }

  // パワーロー比に基づいて市場状態のラベルと色を決定する関数
  const getMarketStatus = (ratio) => {
    if (ratio === null || ratio === undefined) {
      return { label: '計算不可', color: 'gray' };
    }

    let label = '';
    let color = '';

    if (ratio <= -50) {
      label = '非常に割安';
      color = 'green';
    } else if (ratio <= -30) {
      label = '割安';
      color = 'green';
    } else if (ratio <= -15) {
      label = 'やや割安';
      color = 'green';
    } else if (ratio < 15) {
      label = '適正';
      color = 'yellow';
    } else if (ratio < 30) {
      label = 'やや割高';
      color = 'orange';
    } else if (ratio < 50) {
      label = '割高';
      color = 'red';
    } else {
      label = '非常に割高';
      color = 'red';
    }

    return { label, color };
  };

  const { label: marketStatusLabel, color: marketStatusColor } = getMarketStatus(powerLawRatio);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-center sm:justify-start mb-6">
            <img
              src="/logo.svg"
              alt="ビットコインパワーロー博士"
              className="h-10 w-10 mr-3"
            />
            <h1 className="text-2xl font-bold text-gray-300">ビットコイン価格トラッカー</h1>
          </div>

          <div className="flex items-center text-gray-400 text-sm mb-4">
            <span>USD/JPY: ¥{exchangeRateData.loading ? '読み込み中...' : exchangeRateData.error ? '150.00 (デフォルト)' : (exchangeRateData.exchangeRate !== undefined && exchangeRateData.exchangeRate !== null ? exchangeRateData.exchangeRate : '-')}</span>
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
                  <p className={`text-lg font-semibold mt-2 ${priceChangePercentage !== null && priceChangePercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    前日比 {priceChangePercentage !== null
                      ? (priceChangePercentage >= 0 ? '+' : '') + formatNumber(priceChangePercentage, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
                      : '-'}
                  </p>
                  {/* パワーロー比と市場状態 */}
                  <p className={`text-lg font-semibold mt-2 ${powerLawRatio !== null && powerLawRatio > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    パワーロー比 {powerLawRatio !== null && typeof powerLawRatio === 'number'
                      ? (powerLawRatio > 0 ? '+' : '') + formatNumber(powerLawRatio, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
                      : '-'}
                  </p>
                  <div className="mt-2">
                    <span className="text-xs text-gray-400">市場状態:</span>
                    <span className={`ml-1 px-2 py-0.5 rounded text-xs font-bold text-white bg-${marketStatusColor}-500`}>
                      {marketStatusLabel}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-gray-400">価格情報なし</p>
              )}
            </div>

            <div className="bg-gray-700 p-4 rounded-lg hover:shadow-lg transition-shadow">
              <p className="text-gray-400 mb-2 flex items-center">
                本日のパワーロー中央価格
                {/* TooltipIcon 削除 */}
              </p>
              {chartData.loading ? (
                <div className="animate-pulse h-8 bg-gray-600 rounded w-1/2"></div>
              ) : (
                <>
                  <p className="text-gray-200 text-2xl">{formatCurrency(Math.round(Math.pow(10, -17.01593313 + 5.84509376 * Math.log10(getDaysSinceGenesis())) * exchangeRateData.exchangeRate), 'JPY')}</p>
                  <p className="text-gray-400 text-sm">({formatCurrency(Math.round(Math.pow(10, -17.01593313 + 5.84509376 * Math.log10(getDaysSinceGenesis()))), 'USD')})</p>
                  <p className="text-gray-400 text-sm mt-2">パワーローモデルの中心価格</p>
                </>
              )}
            </div>

            <div className="bg-gray-700 p-4 rounded-lg hover:shadow-lg transition-shadow">
              <p className="text-gray-400 mb-2 flex items-center">
                本日のパワーロー下限価格
                {/* TooltipIcon 削除 */}
              </p>
              <>
                <p className="text-gray-200 text-2xl">{formatCurrency(Math.round(Math.pow(10, -17.668) * Math.pow(getDaysSinceGenesis(), 5.926) * exchangeRateData.exchangeRate), 'JPY')}</p>
                <p className="text-gray-400 text-sm">(${(Math.round(Math.pow(10, -17.668) * Math.pow(getDaysSinceGenesis(), 5.926))).toLocaleString()})</p>
                <p className="text-gray-400 text-sm mt-2">過去の暴落時の底値から算出された下限価格</p>
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
          {/* ↓このh2要素を削除 */}
          <BitcoinPowerLawChart exchangeRate={exchangeRateData.exchangeRate} />
          {/* ↓ここに決定係数を表示する要素を追加 */}
          {chartData.rSquared !== null && (
            <div className="text-right text-sm text-gray-400 mt-2">
              決定係数 (R²): {chartData.rSquared.toFixed(4)}
            </div>
          )}
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
          <div className="flex flex-col items-center">
            <img
              src="/logo.svg"
              alt="ビットコインパワーロー博士"
              className="h-8 w-8 mb-2"
            />
            <p>
              © {new Date().getFullYear()} BTCパワーロー博士{' '}
              <a href="https://x.com/lovewaves711" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                @lovewaves711
              </a>
              . All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;