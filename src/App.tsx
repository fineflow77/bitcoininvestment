import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Dashboard from './pages/Home';
import InvestmentSimulator from './components/simulators/InvestmentSimulator';
import WithdrawalSimulator from './components/simulators/WithdrawalSimulator';
import PowerLawExplanation from './pages/PowerLawExplanation';
import PowerLawChart from './components/charts/PowerLawChart.tsx'; // 拡張子 .tsx を追加
import { useBitcoinData } from './hooks/useBitcoinData';
import { PriceModel } from './utils/constants.ts'; // 拡張子 .ts を追加

const App: React.FC = () => {
  const {
    loading,
    error,
    currentPrice,
    linearLogData = [], // デフォルトで空配列
    logLogData = [],   // デフォルトで空配列
    exchangeRate,
    rSquared,
  } = useBitcoinData();

  // powerLawData は linearLogData を使用（要件に合わせて調整）
  const powerLawData = linearLogData;

  // powerLawPosition の計算を防御的に
  const powerLawPosition = powerLawData.length > 0 && currentPrice?.prices.usd
    ? ((currentPrice.prices.usd - powerLawData[powerLawData.length - 1].medianModel) /
      powerLawData[powerLawData.length - 1].medianModel) * 100
    : null;

  // WithdrawalSimulator用のラッパーコンポーネント
  const WithdrawalSimulatorWrapper: React.FC = () => (
    <WithdrawalSimulator
      initialBTC="0.1"
      startYear="2025"
      priceModel={PriceModel.STANDARD}
      withdrawalType="fixed"
      withdrawalAmount="200000"
      withdrawalRate="4"
      showSecondPhase={false}
      secondPhaseYear="2030"
      secondPhaseType="fixed"
      secondPhaseAmount="200000"
      secondPhaseRate="4"
      taxRate="20.315"
      exchangeRate="150"
      inflationRate="0"
    />
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/simulators/investment" element={<InvestmentSimulator />} />
          <Route path="/simulators/withdrawal" element={<WithdrawalSimulatorWrapper />} />
          <Route
            path="/power-law-explanation"
            element={
              <PowerLawExplanation
                chartComponent={
                  loading ? (
                    <div className="flex items-center justify-center min-h-[500px] bg-gray-800 rounded-lg">
                      <p className="text-xl text-gray-400">Loading...</p>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center min-h-[500px] bg-gray-800 rounded-lg">
                      <p className="text-xl text-red-500">Error: {error.message}</p>
                    </div>
                  ) : (
                    <>
                      {/* Linear-Log チャート */}
                      <PowerLawChart
                        exchangeRate={exchangeRate}
                        rSquared={rSquared || 0}
                        chartData={linearLogData}
                        currentPrice={currentPrice?.prices.usd}
                        height={500}
                        showPositionInfo={true}
                        isZoomed={false}
                        powerLawPosition={powerLawPosition}
                        xAxisScale="linear"
                        yAxisScale="log"
                        chartTitle="Bitcoin Power Law Chart (Linear X, Log Y)"
                      />
                      {/* Log-Log チャート */}
                      <PowerLawChart
                        exchangeRate={exchangeRate}
                        rSquared={rSquared || 0}
                        chartData={logLogData}
                        currentPrice={currentPrice?.prices.usd}
                        height={500}
                        showPositionInfo={true}
                        isZoomed={false}
                        powerLawPosition={powerLawPosition}
                        xAxisScale="log"
                        yAxisScale="log"
                        chartTitle="Bitcoin Power Law Chart (Log X, Log Y)"
                      />
                    </>
                  )
                }
              />
            }
          />
        </Routes>
      </main>
      <footer className="bg-gray-900 py-6">
        <div className="bg-gray-900 rounded-md text-sm text-gray-400 text-center">
          <p>※ 予測は理論モデルに基づく参考値です。投資は自己責任で。</p>
          <p className="mt-2">
            © 2025 BTCパワーロー博士{' '}
            <a href="https://x.com/lovewaves711" target="_blank" rel="noopener noreferrer">
              @lovewaves711
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;