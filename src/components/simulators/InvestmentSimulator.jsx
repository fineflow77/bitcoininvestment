import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";


// 標準モデルの価格データ（USD）　median price
export const STANDARD_PRICE_MODEL = {
  2025: 142366, 2026: 198829, 2027: 272715, 2028: 368338, 2029: 489854,
  2030: 642876, 2031: 833567, 2032: 1069651, 2033: 1357794, 2034: 1707510,
  2035: 2128810, 2036: 2634369, 2037: 3233861, 2038: 3942287, 2039: 4774799,
  2040: 5750930, 2041: 6883650, 2042: 8195384, 2043: 9707888, 2044: 11449903,
  2045: 13437626, 2046: 15703268, 2047: 18276812, 2048: 21199058, 2049: 24488878,
  2050: 28191103
};

// 保守的モデルの価格データ（USD） support price
export const CONSERVATIVE_PRICE_MODEL = {
  2025: 64299, 2026: 90216, 2027: 124283, 2028: 168561, 2029: 225056,
  2030: 296473, 2031: 385798, 2032: 496776, 2033: 632683, 2034: 798166,
  2035: 998142, 2036: 1238834, 2037: 1525072, 2038: 1864267, 2039: 2263949,
  2040: 2733807, 2041: 3280418, 2042: 3914969, 2043: 4648382, 2044: 5495042,
  2045: 6463297, 2046: 7569343, 2047: 8828378, 2048: 10260976, 2049: 11877040,
  2050: 13699279
};


const InvestmentSimulator = () => {
  const [initialBTC, setInitialBTC] = useState("");
  const [monthlyInvestment, setMonthlyInvestment] = useState("");
  const [endYear, setEndYear] = useState(2050);
  const [priceModel, setPriceModel] = useState("standard");
  const [results, setResults] = useState([]);

  const formatCurrency = (value) => {
    if (value >= 1e8) return `${(value / 1e8).toFixed(2)}億円`;
    return `${(value / 1e4).toFixed(0)}万`;
  };

  const simulate = () => {
    const selectedModel = priceModel === "standard" ? STANDARD_PRICE_MODEL : CONSERVATIVE_PRICE_MODEL;
    let btcBalance = parseFloat(initialBTC) || 0;
    const investmentResults = [];
    const exchangeRate = 150;

    for (let year = 2025; year <= endYear; year++) {
      const btcPriceUSD = selectedModel[year];
      const btcPriceJPY = btcPriceUSD * exchangeRate;
      const yearlyInvestment = (parseFloat(monthlyInvestment) || 0) * 12;
      const additionalBTC = yearlyInvestment / btcPriceJPY;
      btcBalance += additionalBTC;
      const totalValue = btcBalance * btcPriceJPY;

      investmentResults.push({
        year,
        btcPrice: btcPriceJPY,
        additionalBTC: additionalBTC.toFixed(6),
        totalBTC: btcBalance.toFixed(6),
        totalValue: totalValue
      });
    }

    setResults(investmentResults);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <h1 className="text-2xl font-bold text-center mb-6">ビットコイン積み立てシミュレーター</h1>

      <div className="grid gap-4">
        <label>
          初期ビットコイン保有量
          <input
            type="number"
            value={initialBTC}
            onChange={(e) => setInitialBTC(e.target.value)}
            className="w-full bg-gray-700 p-2 rounded-md mt-1"
            placeholder="例: 0.1"
          />
        </label>

        <label>
          月額積み立て額（円）
          <input
            type="number"
            value={monthlyInvestment}
            onChange={(e) => setMonthlyInvestment(e.target.value)}
            className="w-full bg-gray-700 p-2 rounded-md mt-1"
            placeholder="例: 10000"
          />
        </label>

        <label>
          積み立て終了年
          <select
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
            className="w-full bg-gray-700 p-2 rounded-md mt-1"
          >
            {Array.from({ length: 26 }, (_, i) => 2025 + i).map((year) => (
              <option key={year} value={year}>{year}年</option>
            ))}
          </select>
        </label>

        <label>
          価格モデル
          <select
            value={priceModel}
            onChange={(e) => setPriceModel(e.target.value)}
            className="w-full bg-gray-700 p-2 rounded-md mt-1"
          >
            <option value="standard">標準モデル</option>
            <option value="conservative">保守的モデル</option>
          </select>
        </label>
      </div>

      <button
        onClick={simulate}
        className="mt-6 w-full bg-blue-500 p-3 rounded-md hover:bg-blue-600"
      >
        シミュレーション実行
      </button>

      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-bold text-center mb-4">資産推移</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={results} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis yAxisId="left" orientation="left" label={{ value: "累積BTC", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "資産評価額", angle: 90, position: "insideRight" }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="totalBTC" name="累積BTC" stroke="#82ca9d" />
              <Line yAxisId="right" type="monotone" dataKey="totalValue" name="資産評価額" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default InvestmentSimulator;