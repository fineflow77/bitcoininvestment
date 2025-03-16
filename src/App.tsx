import React from 'react';
import { Route, Routes } from 'react-router-dom'; // Router を削除し、Route, Routes のみをインポート
import { useBitcoinData } from './hooks/useBitcoinData';
import Home from './pages/Home';
import PowerLawChartWrapper from './components/charts/PowerLawChartWrapper';
import LogLogPowerLawChart from './components/charts/LogLogPowerLawChart';

const App: React.FC = () => {
  const {
    loading,
    error,
    currentPrice,
    exchangeRate,
    linearLogData,
    logLogData,
    rSquared,
  } = useBitcoinData();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <> {/* Router を削除し、代わりに React.Fragment (<></>) で囲む */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/linear-log"
          element={
            <PowerLawChartWrapper
              rSquared={rSquared}
              chartData={linearLogData}
              exchangeRate={exchangeRate}
              currentPrice={currentPrice?.prices.usd ?? 0}
              height={600}
              isZoomed={false}
              powerLawPosition={null}
              chartTitle="Linear-Log Power Law Chart"
            />
          }
        />
        <Route
          path="/log-log"
          element={
            <LogLogPowerLawChart
              rSquared={rSquared}
              chartData={logLogData}
              exchangeRate={exchangeRate}
              currentPrice={currentPrice?.prices.usd ?? 0}
              height={600}
              isZoomed={false}
              powerLawPosition={null}
            />
          }
        />
      </Routes>
    </>
  );
};

export default App;