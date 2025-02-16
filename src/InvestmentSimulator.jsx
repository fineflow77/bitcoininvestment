import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// 標準モデルの価格データ（USD）
const STANDARD_PRICE_MODEL = {
  2025: 119149, 2026: 164838, 2027: 224080, 2028: 300087, 2029: 395880,
  2030: 515565, 2031: 663597, 2032: 845554, 2033: 1066109, 2034: 1332033,
  2035: 1650360, 2036: 2030018, 2037: 2477564, 2038: 3003430, 2039: 3618011,
  2040: 4334781, 2041: 5162243, 2042: 6115691, 2043: 7209740, 2044: 8463860,
  2045: 9888310, 2046: 11504687, 2047: 13332764, 2048: 15399747, 2049: 17717118,
  2050: 20314501
};

// 保守的モデルの価格データ（USD）
const CONSERVATIVE_PRICE_MODEL = {
  2025: 68563, 2026: 94854, 2027: 128945, 2028: 172682, 2029: 227805,
  2030: 296677, 2031: 381860, 2032: 486566, 2033: 613482, 2034: 766505,
  2035: 949683, 2036: 1168153, 2037: 1425690, 2038: 1728294, 2039: 2081948,
  2040: 2494406, 2041: 2970561, 2042: 3519213, 2043: 4148772, 2044: 4870443,
  2045: 5690128, 2046: 6620256, 2047: 7672205, 2048: 8861629, 2049: 10195137,
  2050: 11689775
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
      <h1 className="text-2xl font-bold text-center mb-6">BTC積み立てシミュレーター</h1>

      <div className="grid gap-4">
        <label>
          初期BTC保有量
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