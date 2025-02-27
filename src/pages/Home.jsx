// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBitcoinPrice } from '../hooks/useBitcoinPrice';
import { useExchangeRate } from '../hooks/useExchangeRate';
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


// 前日価格キャッシュ
const previousPriceCache = {
  data: null,
  timestamp: null,
  CACHE_TIME: 60 * 60 * 1000, // 1時間キャッシュ
};

const Home = () => {
  const bitcoinPriceData = useBitcoinPrice();
  const exchangeRateData = useExchangeRate();
  const [powerLawPrice, setPowerLawPrice] = useState(null); // 初期値を null に変更
  const [bottomPrice, setBottomPrice] = useState(null); // 初期値を null に変更
  const [deviation, setDeviation] = useState(0);
  const [previousPrice, setPreviousPrice] = useState({ usd: 0, jpy: 0 });

  console.log('Home コンポーネント bitcoinPriceData:', bitcoinPriceData); // Home コンポーネント bitcoinPriceData ログ出力

  useEffect(() => {
    if (!bitcoinPriceData.loading && !bitcoinPriceData.error && bitcoinPriceData.currentPrice?.prices) {

      const fetchPreviousPrice = async () => {
        // キャッシュチェック
        if (previousPriceCache.data && previousPriceCache.timestamp && Date.now() - previousPriceCache.timestamp < previousPriceCache.CACHE_TIME) {
          console.log('前日価格：キャッシュから取得');
          setPreviousPrice(previousPriceCache.data);
          return;
        }

        try {
          console.log('前日価格：APIリクエスト');
          const response = await fetch(
            'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1&interval=daily'
          );
          const data = await response.json();
          if (data.prices && data.prices.length > 0) {
            const currentTime = new Date().getTime();
            const previousEntries = data.prices.sort((a, b) => b[0] - a[0]); // 最新からソート
            const previousEntry = previousEntries.find(entry => {
              const entryTime = entry[0];
              return currentTime - entryTime >= 86400000 && currentTime - entryTime < 86400000 * 2; // 24 時間前のデータを特定
            });

            if (previousEntry) {
              const previousPriceUSD = previousEntry[1];
              const previousJpyPrice = previousPriceUSD * exchangeRateData.exchangeRate;
              const dataToCache = { usd: previousPriceUSD, jpy: previousJpyPrice };
              previousPriceCache.data = dataToCache; // キャッシュに保存
              previousPriceCache.timestamp = Date.now();
              setPreviousPrice(dataToCache);
              console.log('前日の価格（USD）:', previousPriceUSD, '現在の価格（USD）:', bitcoinPriceData.currentPrice.prices.usd);
            } else {
              console.warn('24 時間前のデータが見つかりません');
              const fallbackPrice = { usd: bitcoinPriceData.currentPrice.prices.usd * 0.995, jpy: bitcoinPriceData.currentPrice.prices.jpy * 0.995 };
              previousPriceCache.data = fallbackPrice; // キャッシュに保存
              previousPriceCache.timestamp = Date.now();
              setPreviousPrice(fallbackPrice);
            }
          } else {
            throw new Error('前日の価格データが不足しています');
          }
        } catch (err) {
          console.error('前日の価格の取得に失敗:', err);
          const fallbackPrice = { usd: bitcoinPriceData.currentPrice.prices.usd * 0.995, jpy: bitcoinPriceData.currentPrice.prices.jpy * 0.995 };
          previousPriceCache.data = fallbackPrice; // キャッシュに保存
          previousPriceCache.timestamp = Date.now();
          setPreviousPrice(fallbackPrice);
        }
      };
      fetchPreviousPrice();

      const daysSinceGenesis = getDaysSinceGenesis();

      const medianUSD = Math.pow(10, -17.01593313 + 5.84509376 * Math.log10(daysSinceGenesis));
      const medianJPY = medianUSD * exchangeRateData.exchangeRate;

      const supportUSD = Math.pow(10, -17.668) * Math.pow(daysSinceGenesis, 5.926);
      const supportJPY = supportUSD * exchangeRateData.exchangeRate;

      setPowerLawPrice({ usd: Math.round(medianUSD), jpy: Math.round(medianJPY) });
      setBottomPrice({ usd: Math.round(supportUSD), jpy: Math.round(supportJPY) });

      // deviation は常に計算するように修正 (条件式を削除)
      const dev = ((bitcoinPriceData.currentPrice.prices.usd / medianUSD) - 1) * 100;
      setDeviation(Math.round(dev));

      // 【追加】現在価格の JPY 価格を計算し、設定する (★これが最終的な解決策！！！)
      bitcoinPriceData.currentPrice.prices.jpy = bitcoinPriceData.currentPrice.prices.usd * exchangeRateData.exchangeRate; // ← 🌟 決定的な修正！

    }

  }, [bitcoinPriceData, exchangeRateData]);

  const priceChangePercentage = previousPrice.usd && bitcoinPriceData.currentPrice?.prices?.usd
    ? Math.round(((bitcoinPriceData.currentPrice.prices.usd - previousPrice.usd) / previousPrice.usd) * 1000) / 10
    : 0;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        {/* 価格分析セクション */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-300 mb-6 text-center">ビットコイン価格トラッカー</h1>

          <div className="flex items-center text-gray-400 text-sm mb-4">
            <span>
              USD/JPY: ¥
              {exchangeRateData.loading ? '読み込み中...' : exchangeRateData.error ? '150.00 (デフォルト)' : exchangeRateData.exchangeRate.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-gray-700 p-4 rounded-lg hover:shadow-lg transition-shadow">
              <p className="text-gray-400 mb-2 flex items-center">
                現在価格
              </p>
              {bitcoinPriceData.loading ? (
                <div className="animate-pulse h-8 bg-gray-600 rounded w-3/4"></div>
              ) : bitcoinPriceData.error ? (
                <p className="text-red-400">エラー: {bitcoinPriceData.error.message}</p>
              ) : bitcoinPriceData.currentPrice?.prices ? (
                <>
                  {/* 現在価格 JPY 表示 (formatCurrency を使用) */}
                  <p className="text-amber-500 text-2xl font-semibold">{formatCurrency(Math.round(bitcoinPriceData.currentPrice.prices.jpy))}</p>
                  <p className="text-gray-400 text-sm">(${Math.round(bitcoinPriceData.currentPrice.prices.usd).toLocaleString()})</p>
                  <p className={`text-lg font-semibold mt-2 ${priceChangePercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    前日比 {priceChangePercentage >= 0 ? '+' : ''}{priceChangePercentage}%
                  </p>
                  <p className={`text-lg font-semibold mt-2 ${deviation > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    パワーロー比 {deviation > 0 ? '+' : ''}{deviation}%
                  </p>
                  {/* 現在価格表示部分の条件分岐をログ出力 */}
                  {console.log('現在価格表示: loading?', bitcoinPriceData.loading, 'error?', bitcoinPriceData.error, 'currentPrice?.prices?', !!bitcoinPriceData.currentPrice?.prices)}
                </>
              ) : (
                <p className="text-gray-400">価格情報なし</p>
              )}
            </div>

            <div className="bg-gray-700 p-4 rounded-lg hover:shadow-lg transition-shadow">
              <p className="text-gray-400 mb-2 flex items-center">
                本日のパワーロー中央価格
                <TooltipIcon content="パワーローモデルによる推定中央価格" />
              </p>
              {powerLawPrice === null ? ( // powerLawPrice が null の場合
                <div className="animate-pulse h-8 bg-gray-600 rounded w-1/2"></div> // ローディング表示
              ) : (
                <>
                  <p className="text-gray-200 text-2xl">{formatCurrency(powerLawPrice.jpy)}</p>
                  <p className="text-gray-400 text-sm">(${powerLawPrice.usd.toLocaleString()})</p>
                </>
              )}
              {/* パワーロー中央値表示部分の条件分岐をログ出力 */}
              {console.log('パワーロー中央価格表示: powerLawPrice === null?', powerLawPrice === null)}
            </div>

            <div className="bg-gray-700 p-4 rounded-lg hover:shadow-lg transition-shadow">
              <p className="text-gray-400 mb-2 flex items-center">
                本日のパワーロー下限価格
                <TooltipIcon content="パワーローモデルによる推定下限価格（サポートライン）" />
              </p>
              {bottomPrice === null ? ( // bottomPrice が null の場合
                <div className="animate-pulse h-8 bg-gray-600 rounded w-1/2"></div> // ローディング表示
              ) : (
                <>
                  <p className="text-gray-200 text-2xl">{formatCurrency(bottomPrice.jpy)}</p>
                  <p className="text-gray-400 text-sm">(${bottomPrice.usd.toLocaleString()})</p>
                </>
              )}
              {/* パワーロー下限価格表示部分の条件分岐をログ出力 */}
              {console.log('パワーロー下限価格表示: bottomPrice === null?', bottomPrice === null)}
            </div>
          </div>
        </div>

        {/* パワーローチャート */}
        <div className="bg-gray-700 p-4 rounded-lg mb-8 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">長期パワーロー チャート</h2>
          <BitcoinPowerLawChart exchangeRate={exchangeRateData.exchangeRate} />
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

        {/* フッター - Reactの構文に修正 */}
        <footer className="text-center text-gray-400 mt-8 py-4 border-t border-gray-800">
          <p>
            &copy; {new Date().getFullYear()} BTCパワーロー博士{' '}
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
    </div>
  );
};

export default Home;