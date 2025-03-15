import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Dashboard from './pages/Home';
import InvestmentSimulator from './components/simulators/InvestmentSimulator';
import WithdrawalSimulator from './components/simulators/WithdrawalSimulator';
import PowerLawExplanation from './pages/PowerLawExplanation';
import PowerLawChart from './components/charts/PowerLawChart';
import { useBitcoinData } from './hooks/useBitcoinData';

const App: React.FC = () => {
  const {
    loading,
    error,
    currentPrice,
    powerLawData,
    exchangeRate,
    rSquared,
  } = useBitcoinData();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/simulators/investment" element={<InvestmentSimulator />} />
          <Route path="/simulators/withdrawal" element={<WithdrawalSimulator />} />
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
                    <PowerLawChart
                      exchangeRate={exchangeRate}
                      rSquared={rSquared || 0}
                      chartData={powerLawData}
                      currentPrice={currentPrice?.prices.usd}
                      height={500}
                      showPositionInfo={true}
                      isZoomed={false}
                    />
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