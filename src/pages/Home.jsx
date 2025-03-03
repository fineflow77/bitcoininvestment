// Home.jsx (CORRECTED)
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useMediaQuery from '../hooks/useMediaQuery';
import BitcoinExtendedPowerLawChart from '../components/simulators/BitcoinExtendedPowerLawChart';
import { useBitcoinDailyData } from '../hooks/useBitcoinDailyData';
import { getDaysSinceGenesis } from '../utils/dateUtils';
import { calculateRSquared, log10, calculatePowerLawPosition, getPowerLawPositionLabel, getPowerLawPositionColor } from '../utils/mathUtils';
import { eachYearOfInterval, subYears } from 'date-fns';
import { formatCurrency } from '../utils/formatters';
import { useExchangeRate } from '../hooks/useExchangeRate';
import { Calendar, TrendingUp, TrendingDown, Bolt, Coins, ChartLine } from "lucide-react";

const Home = () => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [selectedRange, setSelectedRange] = useState('1y'); // デフォルトで1年表示
  const [buyRecommendation, setBuyRecommendation] = useState(false);

  const exchangeRateData = useExchangeRate();
  const exchangeRate = exchangeRateData.exchangeRate || 150.0; // 為替レート、ロード中やエラー時はデフォルト値

  const { loading, dailyPrices, currentPrice, error } = useBitcoinDailyData();

  // weeklyPrices.jsonを読み込む
  const [weeklyPrices, setWeeklyPrices] = useState([]);
  useEffect(() => {
    fetch('/weeklyPrices.json')
      .then(response => response.json())
      .then(data => setWeeklyPrices(data))
      .catch(err => console.error('Failed to load weeklyPrices.json:', err));
  }, []);

  // 現在価格の取得
  const currentBtcPrice = useMemo(() => {
    if (!loading && currentPrice?.prices?.usd) {
      return currentPrice.prices.usd;
    }
    return null;
  }, [loading, currentPrice]);

  // データ統合
  const combinedPriceData = useMemo(() => {
    if (!weeklyPrices.length || !dailyPrices.length) return [];

    const startDate = new Date('2010-01-01');
    const startTimestamp = startDate.getTime();

    let combined = weeklyPrices.map(wp => ({
      date: new Date(wp.date).getTime(),
      price: wp.price,
    }));

    const weeklyTimestamps = new Set(combined.map(wp => wp.date));
    dailyPrices.forEach(dp => {
      const dailyTimestamp = new Date(dp.date).getTime();
      if (!weeklyTimestamps.has(dailyTimestamp) && dailyTimestamp >= startTimestamp) {
        combined.push({ date: dailyTimestamp, price: dp.price });
      }
    });

    if (currentPrice?.prices?.usd) {
      const todayTimestamp = new Date().setHours(0, 0, 0, 0);
      if (!combined.some(d => d.date === todayTimestamp) && todayTimestamp >= startTimestamp) {
        combined.push({ date: todayTimestamp, price: currentPrice.prices.usd });
      }
    }

    return combined.sort((a, b) => a.date - b.date);
  }, [weeklyPrices, dailyPrices, currentPrice]);

  // パワーロー価格を計算
  const powerLawPrices = useMemo(() => {
    if (!exchangeRateData.exchangeRate) {
      return { daysSinceGenesis: 0, medianUSD: 0, supportUSD: 0, medianJPY: 0, supportJPY: 0 };
    }
    try {
      const daysSinceGenesis = getDaysSinceGenesis(new Date());
      const rate = exchangeRateData.exchangeRate;

      const medianModelLog = -17.01593313 + 5.84509376 * log10(daysSinceGenesis);
      const supportModelLog = -17.668 + 5.926 * log10(daysSinceGenesis);

      return {
        daysSinceGenesis,
        medianUSD: Math.pow(10, medianModelLog),
        supportUSD: Math.pow(10, supportModelLog),
        medianJPY: Math.pow(10, medianModelLog) * rate,
        supportJPY: Math.pow(10, supportModelLog) * rate,
      };
    } catch (error) {
      console.error("Error calculating power law prices:", error);
      return { daysSinceGenesis: 0, medianUSD: 0, supportUSD: 0, medianJPY: 0, supportJPY: 0 };
    }
  }, [exchangeRateData.exchangeRate]);

  // パワーロー比の計算（中央価格との比較）
  const powerLawRatio = useMemo(() => {
    if (!currentBtcPrice || !powerLawPrices.medianUSD) return null;
    return ((currentBtcPrice / powerLawPrices.medianUSD) - 1) * 100;
  }, [currentBtcPrice, powerLawPrices.medianUSD]);

  // パワーロー位置の計算（下限と中央の間の相対位置）
  const powerLawPosition = useMemo(() => {
    if (!currentBtcPrice || !powerLawPrices.medianUSD || !powerLawPrices.supportUSD) return null;
    try {
      return calculatePowerLawPosition(currentBtcPrice, powerLawPrices.medianUSD, powerLawPrices.supportUSD);
    } catch (error) {
      console.error("Error calculating power law position:", error);
      return null;
    }
  }, [currentBtcPrice, powerLawPrices.medianUSD, powerLawPrices.supportUSD]);

  // パワーロー評価（市場状況の7段階評価）
  const powerLawEvaluation = useMemo(() => {
    if (powerLawPosition === null || powerLawPosition === undefined) {
      return { text: "計算不能", color: "text-gray-400" };
    }

    try {
      const positionLabel = getPowerLawPositionLabel(powerLawPosition);
      const positionColor = getPowerLawPositionColor(powerLawPosition);
      return { text: positionLabel, color: positionColor };
    } catch (error) {
      console.error("Error getting power law evaluation:", error);
      return { text: "計算不能", color: "text-gray-400" };
    }
  }, [powerLawPosition]);

  // 前日比を計算
  const priceChangePercentage = useMemo(() => {
    if (!combinedPriceData.length || !currentBtcPrice) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayTimestamp = yesterday.getTime();

    const todayPriceData = combinedPriceData.find(d => d.date === todayTimestamp);
    const yesterdayPriceData = combinedPriceData.find(d => d.date === yesterdayTimestamp);
    if (!todayPriceData || !yesterdayPriceData) return null;
    if (!todayPriceData.price || !yesterdayPriceData.price || yesterdayPriceData.price === 0) return null;

    return ((todayPriceData.price - yesterdayPriceData.price) / yesterdayPriceData.price) * 100;
  }, [combinedPriceData, currentBtcPrice]);

  // R²計算
  const rSquared = useMemo(() => {
    if (!combinedPriceData.length) return 0.9579; // デフォルト値

    try {
      const rSquaredData = combinedPriceData
        .filter(d => d.price !== null && d.price > 0)
        .map(d => [d.date, d.price]);

      const calculatedRSquared = calculateRSquared(rSquaredData);
      return calculatedRSquared !== null ? calculatedRSquared : 0.9579;
    } catch (error) {
      console.error("Error calculating R squared:", error);
      return 0.9579;
    }
  }, [combinedPriceData]);

  // 買い推奨の判定（下限価格±10%の範囲）
  useEffect(() => {
    try {
      if (currentBtcPrice && powerLawPrices.supportUSD) {
        const threshold = 10;
        const deviationFromSupport = ((currentBtcPrice / powerLawPrices.supportUSD) - 1) * 100;
        setBuyRecommendation(deviationFromSupport <= threshold && deviationFromSupport >= -threshold);
      } else {
        setBuyRecommendation(false);
      }
    } catch (error) {
      console.error("Error calculating buy recommendation:", error);
      setBuyRecommendation(false);
    }
  }, [currentBtcPrice, powerLawPrices.supportUSD]);


  // 安全なformatCurrency呼び出し
  const safeFormatCurrency = (value, currency) => {
    try {
      if (value === null || value === undefined || isNaN(value)) return '-';
      return formatCurrency(value, currency);
    } catch (error) {
      console.error("Error formatting currency:", error);
      return '-';
    }
  };
  // チャートデータ生成
  const chartData = useMemo(() => {
    if (!combinedPriceData.length) return [];
    const data = [];

    combinedPriceData.forEach(point => {
      const date = new Date(point.date);
      const timestamp = point.date;
      const daysSinceGenesis = Math.max(1, getDaysSinceGenesis(date));
      const medianModelLog = -17.01593313 + 5.84509376 * log10(daysSinceGenesis);
      const supportModelLog = -17.668 + 5.926 * log10(daysSinceGenesis);
      const medianPrice = Math.pow(10, medianModelLog);
      const supportPrice = Math.pow(10, supportModelLog);

      data.push({
        date: timestamp,
        medianModel: Math.max(0.00001, medianPrice), // 実際の価格
        supportModel: Math.max(0.00001, supportPrice), // 実際の価格
        price: point.price,
        priceJPY: point.price * exchangeRate,
        medianModelJPY: Math.max(0.00001, medianPrice) * exchangeRate,
        supportModelJPY: Math.max(0.00001, supportPrice) * exchangeRate,
      });
    });

    // モデル線を1年ごとで追加
    const years = eachYearOfInterval({ start: new Date('2010-01-01'), end: new Date('2040-12-31') });
    years.forEach(currentDate => {
      const timestamp = currentDate.getTime();
      if (!data.some(d => d.date === timestamp)) {
        const daysSinceGenesis = Math.max(1, getDaysSinceGenesis(currentDate));
        const medianModelLog = -17.01593313 + 5.84509376 * log10(daysSinceGenesis);
        const supportModelLog = -17.668 + 5.926 * log10(daysSinceGenesis);
        const medianPrice = Math.pow(10, medianModelLog);
        const supportPrice = Math.pow(10, supportModelLog);

        data.push({
          date: timestamp,
          medianModel: Math.max(0.00001, medianPrice), // 実際の価格
          supportModel: Math.max(0.00001, supportPrice), // 実際の価格
          price: null,
          priceJPY: null,
          medianModelJPY: Math.max(0.00001, medianPrice) * exchangeRate,
          supportModelJPY: Math.max(0.00001, supportPrice) * exchangeRate,
        });
      }
    });
    return data.sort((a, b) => a.date - b.date);
  }, [combinedPriceData, exchangeRate]);

  // 期間によるデータフィルタリング
  const filteredChartData = useMemo(() => {
    if (!chartData.length) return [];

    const today = new Date().getTime();
    const startDate = new Date('2011-01-01');
    let fromDate;

    switch (selectedRange) {
      case '10y':
        fromDate = subYears(new Date(today), 10).getTime();
        break;
      case '5y':
        fromDate = subYears(new Date(today), 5).getTime();
        break;
      case '2y':
        fromDate = subYears(new Date(today), 2).getTime();
        break;
      case '1y':
        fromDate = subYears(new Date(today), 1).getTime();
        break;
      case '6m':
        fromDate = subYears(new Date(today), 0.5).getTime();
        break;
      case 'all':
      default:
        fromDate = startDate.getTime();
        break;
    }

    return chartData.filter(d => {
      if (d.date > today && (d.medianModel || d.supportModel)) return true; // 未来予測
      return d.date >= fromDate && d.date <= today; // 過去データ
    });
  }, [chartData, selectedRange]);

  // DateRangeSelector component
  const DateRangeSelector = React.memo(({ selectedRange, onRangeChange }) => (
    <div className="flex items-center w-full mb-2">
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
                      '6ヶ月'}
          </button>
        ))}
      </div>
    </div>
  ));

  // CustomLegend component
  const CustomLegend = React.memo(() => (
    <div className="flex gap-2 sm:gap-6 justify-end flex-wrap">
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: '#FF9500' }} />
        <span className="text-gray-200 text-xs sm:text-sm">実際価格</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: '#3DDC84' }} />
        <span className="text-gray-200 text-xs sm:text-sm">中央価格</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: '#FF2D55' }} />
        <span className="text-gray-200 text-xs sm:text-sm">下限価格</span>
      </div>
    </div>
  ));

  // RSquaredDisplay component
  const RSquaredDisplay = React.memo(({ rSquared }) => (
    <div className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-75 px-2 py-1 rounded text-gray-300 text-xs">
      決定係数 (R²): {rSquared.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
    </div>
  ));

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">ビットコイン パワーロー ダッシュボード</h1>

        {/* 為替レートと期間セレクタ */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="text-sm text-gray-400 mb-2 md:mb-0">
            USD/JPY: ¥{exchangeRateData.loading ? '読み込み中...' :
              exchangeRateData.error ? '150.00 (デフォルト)' :
                (exchangeRateData.exchangeRate !== undefined ?
                  exchangeRateData.exchangeRate.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '150.00 (デフォルト)')}
          </div>

        </div>
        <CustomLegend />

        {/* Price Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Current Price Card */}
          <div className="bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">現在価格</h2>
            {loading ? (
              <div className="animate-pulse h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            ) : error ? (
              <p className="text-red-500">エラー: {error}</p>
            ) : (
              <>
                <p className="text-2xl font-bold text-yellow-500">
                  {currentBtcPrice && exchangeRateData.exchangeRate
                    ? safeFormatCurrency(Math.round(currentBtcPrice * exchangeRateData.exchangeRate), 'JPY')
                    : '-'}
                </p>
                <p className="text-sm text-gray-400">
                  ({currentBtcPrice ? safeFormatCurrency(currentBtcPrice, 'USD') : '-'})
                </p>
                {/* 前日比表示 */}
                {priceChangePercentage !== null && (
                  <div className={`flex items-center text-base sm:text-lg font-semibold mt-2 ${priceChangePercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {priceChangePercentage >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    前日比 {(priceChangePercentage >= 0 ? '+' : '') + priceChangePercentage.toFixed(1)}%
                  </div>
                )}                {/* パワーロー比 */}
                {powerLawRatio !== null && (
                  <p className={`text-base sm:text-lg font-semibold mt-2 ${powerLawRatio > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    パワーロー比: {(powerLawRatio > 0 ? '+' : '') + powerLawRatio.toFixed(1)}%
                  </p>
                )}
                {/* パワーロー位置 */}
                {powerLawEvaluation && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-400">市場評価:</span>
                    <span className={`ml-1 px-2 py-0.5 rounded text-xs font-bold ${powerLawEvaluation.color}`}>
                      {powerLawEvaluation.text}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Median Price Card */}
          <div className="bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">パワーロー中央価格</h2>
            <p className="text-2xl font-bold text-green-400">
              {safeFormatCurrency(Math.round(powerLawPrices?.medianJPY || 0), 'JPY')}
            </p>
            <p className="text-sm text-gray-400">
              ({safeFormatCurrency(powerLawPrices?.medianUSD || 0, 'USD')})
            </p>
            <p className="text-sm text-gray-400 mt-2">
              累計日数: {powerLawPrices.daysSinceGenesis.toLocaleString()} 日
            </p>
            <p className="text-xs text-gray-500 mt-1">
              理論上の「適正価格」を表します
            </p>
          </div>

          {/* Support Price Card */}
          <div className="bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">パワーロー下限価格</h2>
            <p className="text-2xl font-bold text-red-500">
              {safeFormatCurrency(Math.round(powerLawPrices?.supportJPY || 0), 'JPY')}
            </p>
            <p className="text-sm text-gray-400">
              ({safeFormatCurrency(powerLawPrices?.supportUSD || 0, 'USD')})
            </p>
            <p className="text-xs text-gray-500 mt-1">
              歴史的にほぼ割り込まないラインです
            </p>
          </div>
        </div>

        {/* 買い推奨アラート */}
        {buyRecommendation && currentBtcPrice && (
          <div className="bg-green-600 p-4 rounded-lg mb-4 text-white">
            <span className="font-bold">買い推奨:</span> 現在価格がパワーロー下限価格に近づきました！
          </div>
        )}

        {/* Chart */}
        {filteredChartData && filteredChartData.length > 0 ? (
          <div className="bg-gray-700 p-2 sm:p-4 rounded-lg relative">
            {/*  RSquaredDisplay will need the rSquared value as a prop */}
            <RSquaredDisplay rSquared={rSquared} />
            {/* Pass `filteredChartData` and `isMobile` as props */}
            <BitcoinExtendedPowerLawChart
              exchangeRate={exchangeRate}


              chartData={filteredChartData}
              isMobile={isMobile}
              rSquared={rSquared}
            />
          </div>
        ) : (
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            表示するデータがありません。
          </div>
        )}

        {/* シミュレーターへのリンク */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* 取り崩しシミュレーター */}
          <Link to="/simulators/withdrawal" className="block">
            <div className="bg-green-600 hover:bg-green-700 transition-colors rounded-lg shadow-lg p-6">
              <div className="flex items-start mb-4">
                <ChartLine className="h-10 w-10 text-green-300 mr-4" />
                <div>
                  <h3 className="text-xl font-bold text-white">取り崩しシミュレーター</h3>
                  <p className="text-green-200 mt-1">保有するビットコインから定期的に引き出す場合の資産推移をシミュレーション</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="inline-block bg-green-800 hover:bg-green-900 text-white py-2 px-4 rounded-md transition-colors">
                  シミュレーターを利用する →
                </span>
              </div>
            </div>
          </Link>

          {/* 積み立てシミュレーター */}
          <Link to="/simulators/investment" className="block">
            <div className="bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg shadow-lg p-6">
              <div className="flex items-start mb-4">
                <Coins className="h-10 w-10 text-blue-300 mr-4" />
                <div>
                  <h3 className="text-xl font-bold text-white">積み立てシミュレーター</h3>
                  <p className="text-blue-200 mt-1">毎月の積立投資でビットコインを購入した場合の資産推移をシミュレーション</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="inline-block bg-blue-800 hover:bg-blue-900 text-white py-2 px-4 rounded-md transition-colors">
                  シミュレーターを利用する →
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* 説明セクション */}
        <div className="mt-8 bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">ビットコインのパワーローについて</h2>
          <p className="text-gray-300 mb-4">
            パワーローモデルは、ビットコインの長期的な価格変動を対数スケールで分析する手法です。
            このモデルは2010年からの価格データに基づき、ビットコインの価値がジェネシスブロック（2009年1月3日）からの
            経過日数に対して対数的な関係で増加することを示しています。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">中央価格（緑線）</h3>
              <p className="text-gray-300">
                過去の価格データから算出された理論上の「適正価格」です。
                長期的に見るとビットコインの価格はこの線を中心に変動する傾向があります。
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">下限価格（赤線）</h3>
              <p className="text-gray-300">
                歴史的に見てビットコインの価格が下回ることが非常に稀な価格ラインです。
                このライン付近で買うことは長期的に見て有利な戦略と考えられています。
              </p>
            </div>
          </div>
          <div className="mt-4 border-t border-gray-700 pt-4">
            <h3 className="text-lg font-semibold mb-2">決定係数（R²）について</h3>
            <p className="text-gray-300">
              決定係数（R²）は、このモデルが実際の価格データにどれだけ適合しているかを示す指標です。
              1に近いほど、モデルの説明力が高いことを意味します。現在の値（{rSquared.toFixed(4)}）は
              ビットコインの価格変動をパワーローモデルで高い精度で説明できることを示しています。
            </p>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            ※ このモデルは投資アドバイスではありません。過去のデータに基づく参考指標としてご利用ください。
          </p>
        </div>
      </div>

      {/* フッター */}
      <footer className="text-center text-gray-400 mt-8 py-4 border-t border-gray-800">
        <p>
          © {new Date().getFullYear()} BTCパワーロー博士{' '}
          <a
            href="https://x.com/lovewaves711"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            @lovewaves711
          </a>
          . All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Home;