import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// BTCの価格データ（JPY）
const BTC_PRICE_JPY = {
  2015: 37000, 2016: 88000, 2017: 1100000, 2018: 420000, 2019: 780000,
  2020: 3000000, 2021: 6400000, 2022: 4800000, 2023: 4300000, 2024: 6000000
};

const InvestmentSimulator = () => {
  const [initialBTC, setInitialBTC] = useState('1');
  const [monthlyInvestment, setMonthlyInvestment] = useState('50000');
  const [endYear, setEndYear] = useState('2034');
  const [compareSP500, setCompareSP500] = useState(false);
  const [results, setResults] = useState([]);

  const simulate = () => {
    const startYear = 2015;
    const parsedInitialBTC = parseFloat(initialBTC);
    const parsedMonthlyInvestment = parseFloat(monthlyInvestment);
    const parsedEndYear = parseInt(endYear);

    if (!parsedInitialBTC || !parsedMonthlyInvestment || parsedInitialBTC <= 0 || parsedMonthlyInvestment <= 0) {
      alert('初期BTC保有量と積み立て額を入力してください');
      return;
    }

    let cumulativeBTC = parsedInitialBTC;
    let cumulativeSP500 = 1000000; // S&P500 初期投資額
    const resultsData = [];

    for (let year = startYear; year <= parsedEndYear; year++) {
      const btcPrice = BTC_PRICE_JPY[year] || BTC_PRICE_JPY[2024];
      const additionalBTC = parsedMonthlyInvestment * 12 / btcPrice;
      cumulativeBTC += additionalBTC;
      
      if (compareSP500) {
        cumulativeSP500 *= 1.08; // S&P500 年率8%成長
      }
      
      resultsData.push({
        year,
        btcPrice,
        additionalBTC,
        cumulativeBTC,
        assetValue: cumulativeBTC * btcPrice,
        sp500Value: compareSP500 ? cumulativeSP500 : null
      });
    }

    setResults(resultsData);
  };

  return (
    <div className="bg-gray-900 min-h-screen p-8 font-sans text-white">
      <h1 className="text-2xl font-semibold mb-6">BTC積み立てシミュレーター</h1>

      <div className="grid gap-6 max-w-3xl">
        <div>
          <label className="block mb-2">初期BTC保有量</label>
          <input type="text" value={initialBTC} onChange={(e) => setInitialBTC(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
        </div>
        <div>
          <label className="block mb-2">毎月の積み立て額 (円)</label>
          <input type="text" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
        </div>
        <div>
          <label className="block mb-2">積み立て終了年</label>
          <select value={endYear} onChange={(e) => setEndYear(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md">
            {Array.from({ length: 21 }, (_, i) => 2015 + i).map(year => (
              <option key={year} value={year}>{year}年</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={compareSP500} onChange={(e) => setCompareSP500(e.target.checked)} />
          <label>S&P500との比較を行う</label>
        </div>
        <button onClick={simulate} className="mt-4 px-6 py-2 bg-blue-500 rounded-md">シミュレーション実行</button>
      </div>

      {results.length > 0 && (
        <div className="mt-8">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={results}>
              <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
              <XAxis dataKey="year" stroke="#e5e7eb" />
              <YAxis stroke="#e5e7eb" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="assetValue" name="BTC資産評価額" stroke="#facc15" strokeWidth={2} />
              {compareSP500 && <Line type="monotone" dataKey="sp500Value" name="S&P500評価額" stroke="#3b82f6" strokeWidth={2} />}
            </LineChart>
          </ResponsiveContainer>

          <table className="mt-6 w-full border border-gray-700 text-left">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-2">年</th>
                <th className="p-2">1BTC予想価格 (円)</th>
                <th className="p-2">追加BTC</th>
                <th className="p-2">累積BTC</th>
                <th className="p-2">資産評価額 (円)</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={row.year} className="border-b border-gray-700">
                  <td className="p-2">{row.year}</td>
                  <td className="p-2">{row.btcPrice.toLocaleString()}円</td>
                  <td className="p-2">{row.additionalBTC.toFixed(6)}</td>
                  <td className="p-2">{row.cumulativeBTC.toFixed(6)}</td>
                  <td className="p-2">{row.assetValue.toLocaleString()}円</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvestmentSimulator;
