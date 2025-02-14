import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';

const BTC_PRICE_MODELS = {
  standard: {
    name: "標準モデル",
    prices: { 2025: 119149, 2026: 164838, 2027: 224080, 2028: 300087, 2029: 395880, 2030: 515565, 2031: 663597, 2032: 845554, 2033: 1066109, 2034: 1332033, 2035: 1650360, 2036: 2030018, 2037: 2477564, 2038: 3003430, 2039: 3618011, 2040: 4334781, 2041: 5162243, 2042: 6115691, 2043: 7209740, 2044: 8463860, 2045: 9888310, 2046: 11504687, 2047: 13332764, 2048: 15399747, 2049: 17717118, 2050: 20314501 }
  },
  conservative: {
    name: "保守的モデル",
    prices: { 2025: 68563, 2026: 94854, 2027: 128945, 2028: 172682, 2029: 227805, 2030: 296677, 2031: 381860, 2032: 486566, 2033: 613482, 2034: 766505, 2035: 949683, 2036: 1168153, 2037: 1425690, 2038: 1728294, 2039: 2081948, 2040: 2494406, 2041: 2970561, 2042: 3519213, 2043: 4148772, 2044: 4870443, 2045: 5690128, 2046: 6620256, 2047: 7672205, 2048: 8861629, 2049: 10195137, 2050: 11689775 }
  }
};

const App = () => {
  const [initialBTC, setInitialBTC] = useState('2');
  const [priceModel, setPriceModel] = useState('standard');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const validateInput = (value) => {
    if (!value || isNaN(value) || parseFloat(value) <= 0) {
      setError('正の数値を入力してください');
      return false;
    }
    setError('');
    return true;
  };

  const simulate = () => {
    if (!validateInput(initialBTC)) return;
    const btcAmount = parseFloat(initialBTC);
    const simResults = [];
    let currentBTC = btcAmount;

    for (let year = 2025; year <= 2050; year++) {
      const priceUSD = BTC_PRICE_MODELS[priceModel].prices[year];
      const btcPriceJPY = priceUSD * 150;
      const totalValue = currentBTC * btcPriceJPY;

      simResults.push({
        year,
        btcPrice: btcPriceJPY,
        totalValue,
        remainingBTC: currentBTC
      });
    }
    setResults(simResults);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-900 text-gray-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">BTC取り崩しシミュレーター</h1>
        <div className="bg-gray-800 rounded-lg p-4 md:p-6 mb-6 md:mb-8">
          <label className="block text-sm font-medium mb-2">初期BTC保有量：</label>
          <input type="text" value={initialBTC} onChange={(e) => setInitialBTC(e.target.value)} className={`bg-gray-700 border ${error ? 'border-red-500' : 'border-gray-600'} rounded-md px-3 py-2 w-full max-w-[200px] text-white`} />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

          <label className="block text-sm font-medium mt-4 mb-2">価格予測モデル：</label>
          <select value={priceModel} onChange={(e) => setPriceModel(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 w-full text-white">
            {Object.entries(BTC_PRICE_MODELS).map(([key, model]) => (
              <option key={key} value={key}>{model.name}</option>
            ))}
          </select>

          <button onClick={simulate} className="bg-blue-600 text-white px-4 py-2 mt-4 rounded-md hover:bg-blue-700">シミュレーション実行</button>
        </div>

        {results.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 md:p-6 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-400">
                <tr>
                  <th className="px-4 py-2">年</th>
                  <th className="px-4 py-2">1BTC価格</th>
                  <th className="px-4 py-2">残存BTC</th>
                  <th className="px-4 py-2">資産評価額</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row) => (
                  <tr key={row.year} className="border-t border-gray-700">
                    <td className="px-4 py-2">{row.year}</td>
                    <td className="px-4 py-2">{row.btcPrice.toLocaleString()} JPY</td>
                    <td className="px-4 py-2">{row.remainingBTC.toFixed(8)}</td>
                    <td className="px-4 py-2">{row.totalValue.toLocaleString()} JPY</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;