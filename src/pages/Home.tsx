import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Info, ArrowUpRight } from 'lucide-react';
import { useBitcoinData } from '../hooks/useBitcoinData';
import PowerLawChart from '../components/charts/PowerLawChartWrapper';
import { formatCurrency } from '../utils/formatters';
import {
  calculatePowerLawPosition,
  getPowerLawPositionLabel,
  getPowerLawPositionColor,
  calculateRSquared,
  formatPercentage,
} from '../utils/models';
import DataContainer from '../components/ui/DataContainer';
import { getDaysSinceGenesis } from '../utils/dateUtils';
import { ChartLineUp } from 'phosphor-react';
import { ChartDataPoint, DataContainerProps } from '../types';

// スタイル定義（省略、変更なし）

const Home: React.FC = () => {
  const { loading, error, currentPrice, exchangeRate, weeklyPrices, powerLawData, dailyPrices } = useBitcoinData();

  const [rSquared, setRSquared] = useState<number>(0.9703);

  useEffect(() => {
    if (weeklyPrices && weeklyPrices.length > 0) {
      const calculatedRSquared = calculateRSquared(
        weeklyPrices.map(item => [new Date(item.date).getTime(), item.price] as [number, number])
      );
      if (calculatedRSquared !== null) setRSquared(calculatedRSquared);
    }
  }, [weeklyPrices]);

  const powerLawPosition = useMemo(() => {
    if (!currentPrice || !powerLawData || powerLawData.length === 0) return null;
    const latestNonFutureData = [...powerLawData]
      .filter(item => !item.isFuture && item.price !== null)
      .sort((a, b) => b.date - a.date)[0];
    if (!latestNonFutureData) return null;

    return calculatePowerLawPosition(currentPrice.prices.usd, latestNonFutureData.medianModel);
  }, [currentPrice, powerLawData]);

  const priceChangePercentage = useMemo(() => {
    if (!currentPrice || !dailyPrices || dailyPrices.length < 2) return null;
    const sortedPrices = [...dailyPrices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sortedPrices.length < 2) return null;
    const latestPrice = currentPrice.prices.usd;
    const yesterdayPrice = sortedPrices[1].price;
    return ((latestPrice - yesterdayPrice) / yesterdayPrice) * 100;
  }, [currentPrice, dailyPrices]);

  const { medianPrice, supportPrice } = useMemo(() => {
    if (!powerLawData || powerLawData.length === 0) return { medianPrice: 0, supportPrice: 0 };
    const now = Date.now();
    const closestPoint = powerLawData.reduce((closest, current) =>
      Math.abs(current.date - now) < Math.abs(closest.date - now) ? current : closest
    );
    return { medianPrice: closestPoint.medianModel, supportPrice: closestPoint.supportModel };
  }, [powerLawData]);

  const daysCount = useMemo(() => getDaysSinceGenesis(new Date()), []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-0 bg-transparent text-gray-100 space-y-6">
        {/* シミュレーターへの導線（省略、変更なし） */}
        <div className="text-center mt-10">
          <p className="text-lg text-gray-300 mb-6">長期ビットコイン投資による資産形成を考える</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <Link to="/simulators/withdrawal" className={`${colors.withdrawalCardBg} p-4 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col items-start justify-between h-auto`}>
              <div>
                <ChartLineUp size={32} weight="fill" className="text-white mb-0" />
                <h2 className={`${typography.h2} text-white mb-1`}>取り崩しシミュレーター</h2>
                <p className="text-gray-100 text-sm">保有するビットコインから定期的に引き出す場合の資産推移をシミュレーション</p>
              </div>
              <span className={`${colors.buttonBg} ${colors.buttonHover} px-4 py-2 rounded-full text-white text-sm font-medium mt-4 self-start flex items-center`}>
                シミュレーターを利用する <ArrowUpRight className="ml-1" size={16} />
              </span>
            </Link>
            <Link to="/simulators/investment" className={`${colors.investmentCardBg} p-4 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col items-start justify-between h-auto`}>
              <div>
                <ChartLineUp size={32} weight="fill" className="text-white mb-0" />
                <h2 className={`${typography.h2} text-white mb-1`}>積み立てシミュレーター</h2>
                <p className="text-gray-100 text-sm">毎月の積立投資でビットコインを購入した場合の資産推移をシミュレーション</p>
              </div>
              <span className={`${colors.buttonBg} ${colors.buttonHover} px-4 py-2 rounded-full text-white text-sm font-medium mt-4 self-start flex items-center`}>
                シミュレーターを利用する <ArrowUpRight className="ml-1" size={16} />
              </span>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center mt-10 mb-4">
          <TrendingUp className="h-6 w-6 mr-2 text-amber-400" />
          <h2 className={`${typography.subtitle} text-amber-400`}>ビットコイン価格トラッカー</h2>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-xs text-gray-400">
            為替レート: {formatCurrency(exchangeRate, 'JPY', { maxDecimals: 2 }).replace('¥', '')}円/USD
          </div>
          <div className="text-xs text-gray-400">
            {currentPrice && <span>最終更新: {new Date(currentPrice.timestamp).toLocaleString('ja-JP', { timeStyle: 'short' })}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className={`${colors.cardBg} p-5 rounded-xl shadow-md ${colors.cardBorderHighlight} transform transition-transform hover:-translate-y-1 duration-300`}>
            <h3 className={`${typography.h3} text-amber-400 mb-1 flex items-center`}>
              <span className="w-3 h-3 rounded-full bg-amber-500 mr-2 animate-pulse" /> 現在価格
            </h3>
            <DataContainer isLoading={loading} error={error} loadingMessage="価格データ取得中..." noDataMessage="価格データが利用できません">
              {currentPrice ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-amber-400">{formatCurrency(currentPrice.prices.jpy, 'JPY')}</div>
                  <div className="text-sm text-gray-300">({formatCurrency(currentPrice.prices.usd, 'USD')})</div>
                  {priceChangePercentage !== null && (
                    <div className={`text-sm font-medium ${priceChangePercentage >= 0 ? 'text-green-400' : 'text-red-400'} flex items-center`}>
                      <span aria-label={priceChangePercentage >= 0 ? '上昇' : '下降'} className={`mr-1 ${priceChangePercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {priceChangePercentage >= 0 ? '↑' : '↓'}
                      </span>
                      前日比: {priceChangePercentage >= 0 ? '+' : ''}{priceChangePercentage.toFixed(2)}%
                    </div>
                  )}
                  {powerLawPosition !== null && (
                    <div className="text-sm font-medium flex items-center" style={{ color: getPowerLawPositionColor(powerLawPosition) }} aria-label={`パワーロー位置: ${formatPercentage(powerLawPosition)}`}>
                      パワーロー位置: {formatPercentage(powerLawPosition)}
                      <span className="ml-1 text-xs">({getPowerLawPositionLabel(powerLawPosition)})</span>
                    </div>
                  )}
                </div>
              ) : null}
            </DataContainer>
          </div>
          <div className={`${colors.cardBg} p-5 rounded-xl shadow-md ${colors.cardBorder} transition-all duration-300 hover:shadow-xl`}>
            <h3 className={`${typography.h3} text-green-400 mb-3 flex items-center`}>
              <span className="w-3 h-3 rounded-full bg-green-500 mr-2" /> 本日のパワーロー中央価格
            </h3>
            <DataContainer isLoading={loading} error={error} loadingMessage="価格データ取得中..." noDataMessage="中央価格データが利用できません">
              {powerLawData && powerLawData.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-lg font-medium text-green-400">{formatCurrency(medianPrice * exchangeRate, 'JPY')}</div>
                  <div className="text-xs text-gray-300">({formatCurrency(medianPrice, 'USD')})</div>
                  <div className="text-xs text-gray-400">累計日数: {daysCount.toLocaleString()} 日</div>
                </div>
              ) : null}
            </DataContainer>
          </div>
          <div className={`${colors.cardBg} p-5 rounded-xl shadow-md ${colors.cardBorder} transition-all duration-300 hover:shadow-xl`}>
            <h3 className={`${typography.h3} text-red-400 mb-3 flex items-center`}>
              <span className="w-3 h-3 rounded-full bg-red-500 mr-2" /> 本日のパワーロー下限価格
            </h3>
            <DataContainer isLoading={loading} error={error} loadingMessage="価格データ取得中..." noDataMessage="下限価格データが利用できません">
              {powerLawData && powerLawData.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-lg font-medium text-red-400">{formatCurrency(supportPrice * exchangeRate, 'JPY')}</div>
                  <div className="text-xs text-gray-300">({formatCurrency(supportPrice, 'USD')})</div>
                  <div className="text-xs text-gray-400">　</div>
                </div>
              ) : null}
            </DataContainer>
          </div>
        </div>

        <div className="py-6"></div>

        <div className="mb-8 mt-2">
          <h2 className="text-center text-lg font-medium text-amber-400 mb-4">ビットコイン長期価格予測（パワーローモデル）</h2>
          <div className={`rounded-xl ${colors.cardBorder} overflow-hidden`}>
            <DataContainer isLoading={loading} error={error} loadingMessage="チャートデータ取得中..." noDataMessage="チャートデータが利用できません">
              {error && (
                <div className="text-red-400 text-center p-4 bg-red-900 bg-opacity-20 rounded-lg border border-red-700">
                  データ取得エラー: {error.message}. 再試行してください。
                </div>
              )}
              {powerLawData && powerLawData.length > 0 ? (
                <PowerLawChart
                  rSquared={rSquared}
                  chartData={powerLawData}
                  exchangeRate={exchangeRate}
                  currentPrice={currentPrice?.prices.usd ?? 0}
                  height={800}
                  isZoomed={false}
                  powerLawPosition={powerLawPosition}
                />
              ) : (
                <div className="p-12 text-center text-gray-400">チャートデータがありません</div>
              )}
            </DataContainer>
          </div>
        </div>

        <div className={`${colors.cardBg} p-5 rounded-xl shadow-md ${colors.cardBorder}`}>
          <h2 className={`${typography.h3} text-amber-400 mb-3 flex items-center`}>
            <Info className="h-4 w-4 mr-2 text-amber-400" />
            パワーローとは
          </h2>
          <p className={`${typography.body} ${colors.textSecondary} mb-3`}>
            ビットコインは、株式等と異なり、パワーローと呼ばれる自然法則に従い、定期的にバブルを発生させながら成長していくことがわかっています。ビットコイン価格のボラティリティが大きいのは事実ですが、対数変換すると右肩上がりでの成長が読み取れます。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 p-3 bg-gray-800 bg-opacity-50 rounded-lg">
              <h3 className={`${typography.subtitle} text-green-400`}>中央価格</h3>
              <p className={`${typography.small} ${colors.textSecondary}`}>
                パワーローモデルが予測する妥当な価格。チャート左上の「決定係数（R²）」は、1に近いほど精度が高い。
              </p>
            </div>
            <div className="space-y-2 p-3 bg-gray-800 bg-opacity-50 rounded-lg">
              <h3 className={`${typography.subtitle} text-red-400`}>下限価格</h3>
              <p className={`${typography.small} ${colors.textSecondary}`}>
                暴落時含め、歴史的にほとんど割れることのない強力なサポートライン。買い場の目安となる。
              </p>
            </div>
          </div>
          <div className="mt-4 text-right">
            <Link to="/power-law-explanation" className="text-amber-400 hover:text-amber-300 text-sm font-medium inline-flex items-center group">
              詳しく学ぶ{' '}
              <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;