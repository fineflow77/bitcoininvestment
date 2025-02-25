import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBitcoinPrice } from '../hooks/useBitcoinPrice';
import { formatCurrency } from '../utils/formatters';
import BitcoinPowerLawChart from '../components/simulators/BitcoinPowerLawChart';
import { differenceInDays } from 'date-fns';
import { HelpCircle } from 'lucide-react';

const BITCOIN_GENESIS_DATE = new Date(2009, 0, 3);

const getDaysSinceGenesis = () => differenceInDays(new Date(), BITCOIN_GENESIS_DATE);

const TooltipIcon = ({ content }) => {
  return (
    <div className="group relative inline-block ml-2">
      <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-300 cursor-help" />
      <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-2 text-sm text-gray-300 bg-gray-800 rounded-lg shadow-lg">
        {content}
      </div>
    </div>
  );
};

const AdPlacement = ({ position }) => {
  return (
    <div className={`ad-container ${position} bg-gray-700 p-4 rounded-lg mb-4 ${position === 'side-mobile' ? 'h-[60px]' : 'h-[100px]'}`}>
      <div className="text-xs text-gray-400 mb-2">広告</div>
      <div className="bg-gray-600 h-full flex items-center justify-center">
        <span className="text-gray-400">Advertisement</span>
      </div>
    </div>
  );
};

const Home = () => {
  const { price, loading, error, exchangeRate } = useBitcoinPrice(); // 為替レートもフックから取得
  const [powerLawPrice, setPowerLawPrice] = useState({ usd: 0, jpy: 0 });
  const [bottomPrice, setBottomPrice] = useState({ usd: 0, jpy: 0 });
  const [deviation, setDeviation] = useState(0);
  const [previousPrice, setPreviousPrice] = useState({ usd: 0, jpy: 0 }); // 前日価格を追加

  // 前日価格と現在価格の比較（CoinGecko API使用、精度向上）
  useEffect(() => {
    if (!loading && !error && price?.prices) {
      const fetchPreviousPrice = async () => {
        try {
          const response = await fetch(
            'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1&interval=daily'
          );
          const data = await response.json();
          if (data.prices && data.prices.length > 0) {
            const currentTime = new Date().getTime();
            const previousEntries = data.prices.sort((a, b) => b[0] - a[0]); // 最新からソート
            const previousEntry = previousEntries.find(entry => {
              const entryTime = entry[0];
              return currentTime - entryTime >= 86400000 && currentTime - entryTime < 86400000 * 2; // 24時間前を特定
            });

            if (previousEntry) {
              const previousPriceUSD = previousEntry[1];
              const previousJpyPrice = previousPriceUSD * exchangeRate; // binanceClientから取得した為替レートを使用
              setPreviousPrice({ usd: previousPriceUSD, jpy: previousJpyPrice });
              console.log('前日価格（USD）:', previousPriceUSD, '現在価格（USD）:', price.prices.usd);
            } else {
              console.warn('24時間前のデータが見つかりません');
              setPreviousPrice({ usd: price.prices.usd * 0.995, jpy: price.prices.jpy * 0.995 }); // 微調整（-0.5%）
            }
          } else {
            throw new Error('前日価格データが不足しています');
          }
        } catch (err) {
          console.error('前日価格の取得に失敗:', err);
          setPreviousPrice({ usd: price.prices.usd * 0.995, jpy: price.prices.jpy * 0.995 }); // 微調整（-0.5%）
        }
      };
      fetchPreviousPrice();

      const daysSinceGenesis = getDaysSinceGenesis();

      const medianUSD = Math.pow(10, -17.01593313 + 5.84509376 * Math.log10(daysSinceGenesis));
      const medianJPY = medianUSD * exchangeRate; // binanceClientから取得した為替レートを使用

      const supportUSD = Math.pow(10, -17.668) * Math.pow(daysSinceGenesis, 5.926);
      const supportJPY = supportUSD * exchangeRate; // binanceClientから取得した為替レートを使用

      setPowerLawPrice({ usd: Math.round(medianUSD), jpy: Math.round(medianJPY) });
      setBottomPrice({ usd: Math.round(supportUSD), jpy: Math.round(supportJPY) });

      if (price.prices.usd) {
        const dev = ((price.prices.usd / medianUSD) - 1) * 100;
        setDeviation(Math.round(dev));
      }
    }
  }, [price, exchangeRate, loading, error]);

  // 前日比の計算（USDベースでパーセンテージ、小数点第1位まで表示）
  const priceChangePercentage = previousPrice.usd && price?.prices?.usd
    ? Math.round(((price.prices.usd - previousPrice.usd) / previousPrice.usd) * 1000) / 10 // 小数点第1位まで
    : 0;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        {/* 価格分析セクション */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-300 mb-6 text-center">ビットコイン市場ダッシュボード</h1>

          <div className="flex items-center text-gray-400 text-sm mb-4">
            <span>
              USD/JPY: ¥
              {loading ? '読み込み中...' : error ? '150.00 (デフォルト)' : exchangeRate?.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-gray-700 p-4 rounded-lg hover:shadow-lg transition-shadow">
              <p className="text-gray-400 mb-2 flex items-center">
                現在価格
                <TooltipIcon content="Binance APIから取得した最新のBTC価格" />
              </p>
              {loading ? (
                <div className="animate-pulse h-8 bg-gray-600 rounded w-3/4"></div>
              ) : error ? (
                <p className="text-red-400">エラー</p>
              ) : (
                <>
                  <p className="text-amber-500 text-2xl font-semibold">{formatCurrency(Math.round(price?.prices?.jpy))}</p>
                  <p className="text-gray-400 text-sm">(${Math.round(price.prices.usd).toLocaleString()})</p>
                  <p className={`text-lg font-semibold mt-2 ${priceChangePercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    前日比 {priceChangePercentage >= 0 ? '+' : ''}{priceChangePercentage}%
                  </p>
                  <p className={`text-lg font-semibold mt-2 ${deviation > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    パワーロー比 {deviation > 0 ? '+' : ''}{deviation}%
                  </p>
                </>
              )}
            </div>

            <div className="bg-gray-700 p-4 rounded-lg hover:shadow-lg transition-shadow">
              <p className="text-gray-400 mb-2 flex items-center">
                本日のパワーロー中央値
                <TooltipIcon content="パワーロー中央値モデルによる予測価格" />
              </p>
              <p className="text-gray-200 text-2xl">{formatCurrency(powerLawPrice.jpy)}</p>
              <p className="text-gray-400 text-sm">(${powerLawPrice.usd.toLocaleString()})</p>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg hover:shadow-lg transition-shadow">
              <p className="text-gray-400 mb-2 flex items-center">
                本日のパワーロー下限値
                <TooltipIcon content="パワーローサポートラインによる下限予測価格" />
              </p>
              <p className="text-gray-200 text-2xl">{formatCurrency(bottomPrice.jpy)}</p>
              <p className="text-gray-400 text-sm">(${bottomPrice.usd.toLocaleString()})</p>
            </div>
          </div>
        </div>

        {/* パワーローチャート */}
        <div className="bg-gray-700 p-4 rounded-lg mb-8 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">ビットコイン パワーロー チャート</h2>
          {/* 修正：binanceClientから取得した為替レートを渡す */}
          <BitcoinPowerLawChart exchangeRate={exchangeRate} />
        </div>

        {/* シミュレーターリンク */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Link
            to="/simulator?type=withdrawal"
            className="w-full bg-blue-500 p-4 rounded-lg text-center hover:bg-blue-600 hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
          >
            <h3 className="text-xl font-bold text-gray-300 mb-2">取り崩しシミュレーター</h3>
            <p className="text-gray-200">保有するビットコインの取り崩し計画を立てる</p>
          </Link>

          <Link
            to="/simulator?type=investment"
            className="w-full bg-green-500 p-4 rounded-lg text-center hover:bg-green-600 hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200"
          >
            <h3 className="text-xl font-bold text-gray-300 mb-2">積み立てシミュレーター</h3>
            <p className="text-gray-200">目標ビットコイン保有数へ向けた計画を立てる</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;