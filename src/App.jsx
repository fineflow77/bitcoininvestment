import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// BTCの価格データ（USD）
const BTC_PRICE_USD = {
  2025: 119149,
  2026: 164838,
  2027: 224080,
  2028: 300087,
  2029: 395880,
  2030: 515565,
  2031: 663597,
  2032: 845554,
  2033: 1066109,
  2034: 1332033,
  2035: 1650360,
  2036: 2030018,
  2037: 2477564,
  2038: 3003430,
  2039: 3618011,
  2040: 4334781,
  2041: 5162243,
  2042: 6115691,
  2043: 7209740,
  2044: 8463860,
  2045: 9888310,
  2046: 11504687,
  2047: 13332764,
  2048: 15399747,
  2049: 17717118,
  2050: 20314501
};

const App = () => {
  // 状態管理
  const [initialBTC, setInitialBTC] = useState('2');
  const [isPhaseTwo, setIsPhaseTwo] = useState(false);
  const [phaseOne, setPhaseOne] = useState({
    startYear: '2030',
    amount: '800000'
  });
  const [phaseTwo, setPhaseTwo] = useState({
    startYear: '2035',
    amount: '500000'
  });
  const [results, setResults] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    usdJpy: 150,
    taxRate: 20.315
  });

  // フォーマット関数
  const formatJPY = (value) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatBTC = (value) => {
    return value.toFixed(8);
  };

  // シミュレーション実行
  const simulate = () => {
    const btcAmount = parseFloat(initialBTC);
    const phase1Start = parseInt(phaseOne.startYear);
    const phase2Start = parseInt(phaseTwo.startYear);

    if (!btcAmount || btcAmount <= 0) {
      alert('初期BTC保有量を入力してください');
      return;
    }

    const simResults = [];
    let currentBTC = btcAmount;

    for (let year = 2025; year <= 2050; year++) {
      const priceUSD = BTC_PRICE_USD[year];
      const btcPriceJPY = priceUSD * settings.usdJpy;
      const totalValue = currentBTC * btcPriceJPY;

      let monthlyAmount = 0;
      if (year >= phase1Start) {
        if (isPhaseTwo && year >= phase2Start) {
          monthlyAmount = parseFloat(phaseTwo.amount);
        } else {
          monthlyAmount = parseFloat(phaseOne.amount);
        }
      }

      const taxRateDecimal = settings.taxRate / 100;
      const yearlyWithdrawal = (monthlyAmount * 12) / (1 - taxRateDecimal);
      const withdrawalBTC = yearlyWithdrawal / btcPriceJPY;
      const remainingBTC = currentBTC - withdrawalBTC;

      simResults.push({
        year,
        btcPrice: btcPriceJPY,
        totalValue,
        withdrawalAmount: yearlyWithdrawal,
        remainingBTC,
        withdrawalRate: (yearlyWithdrawal / totalValue) * 100
      });

      currentBTC = remainingBTC;
      if (currentBTC <= 0) break;
    }

    setResults(simResults);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* タイトル */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">BTC取崩シミュレーター</h1>
        
        {/* 入力フォームエリア */}
        <div className="bg-gray-900 rounded-lg p-4 md:p-6 mb-6 md:mb-8">
          <div className="grid gap-4 md:gap-6">
            {/* BTC保有量入力 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                初期BTC保有量
              </label>
              <input
                type="text"
                value={initialBTC}
                onChange={(e) => setInitialBTC(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 w-full max-w-[200px] text-white"
              />
            </div>

            {/* 月額入力 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                第1段階：月額（税引後）
              </label>
              <input
                type="text"
                value={phaseOne.amount}
                onChange={(e) => setPhaseOne({...phaseOne, amount: e.target.value})}
                className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 w-full max-w-[200px] text-white"
              />
            </div>

            {/* 年選択 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                取崩開始年
              </label>
              <select
                value={phaseOne.startYear}
                onChange={(e) => setPhaseOne({...phaseOne, startYear: e.target.value})}
                className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 w-full max-w-[200px] text-white"
              >
                {Array.from({length: 26}, (_, i) => 2025 + i).map(year => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
            </div>

            {/* 2段階目チェックボックス */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPhaseTwo}
                onChange={(e) => setIsPhaseTwo(e.target.checked)}
                className="w-4 h-4"
              />
              <label className="text-sm">
                2段階目の取崩しを設定
              </label>
            </div>

            {/* 2段階目設定 */}
            {isPhaseTwo && (
              <div className="pl-4 md:pl-6 border-l-2 border-gray-700">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      第2段階：開始年
                    </label>
                    <select
                      value={phaseTwo.startYear}
                      onChange={(e) => setPhaseTwo({...phaseTwo, startYear: e.target.value})}
                      className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 w-full max-w-[200px] text-white"
                    >
                      {Array.from({length: 26}, (_, i) => 2025 + i)
                        .filter(year => year > parseInt(phaseOne.startYear))
                        .map(year => (
                          <option key={year} value={year}>{year}年</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      第2段階：月額（税引後）
                    </label>
                    <input
                      type="text"
                      value={phaseTwo.amount}
                      onChange={(e) => setPhaseTwo({...phaseTwo, amount: e.target.value})}
                      className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 w-full max-w-[200px] text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* シミュレーションボタン */}
            <div>
              <button
                onClick={simulate}
                className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm md:text-base"
              >
                シミュレーション実行
              </button>
            </div>

            {/* 設定ボタンと設定パネル */}
            <div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-400 text-xs md:text-sm hover:text-gray-300 transition-colors flex items-center gap-2 flex-wrap"
              >
                <span>⚙️</span>
                <span>為替レート: ¥{settings.usdJpy}/USD・税率: {settings.taxRate}%</span>
              </button>

              {showSettings && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg max-w-md">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">
                        USD/JPY為替レート
                      </label>
                      <input
                        type="number"
                        value={settings.usdJpy}
                        onChange={(e) => setSettings({...settings, usdJpy: parseFloat(e.target.value)})}
                        className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 w-full text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">
                        税率 (%)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={settings.taxRate}
                        onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value)})}
                        className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 w-full text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 結果テーブル */}
        {results.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-4 md:p-6 mb-6 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-400">
                <tr>
                  <th className="px-4 py-2">年</th>
                  <th className="px-4 py-2">1BTC予想価格</th>
                  <th className="px-4 py-2">取り崩し率</th>
                  <th className="px-4 py-2">年間取崩し額</th>
                  <th className="px-4 py-2">残存BTC</th>
                  <th className="px-4 py-2">資産評価額</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row) => (
                  <tr key={row.year} className="border-t border-gray-800">
                    <td className="px-4 py-2">{row.year}年</td>
                    <td className="px-4 py-2">{formatJPY(row.btcPrice)}</td>
                    <td className="px-4 py-2">{row.withdrawalRate.toFixed(2)}%</td>
                    <td className="px-4 py-2">{formatJPY(row.withdrawalAmount)}</td>
                    <td className="px-4 py-2">{formatBTC(row.remainingBTC)}</td>
                    <td className="px-4 py-2">{formatJPY(row.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* グラフエリア */}
        {results.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-4 md:p-6 w-full">
            <div style={{ width: '100%', height: '500px' }}>
              <ResponsiveContainer>
                <LineChart
                  data={results}
                  margin={{
                    top: 20,
                    right: 60,
                    left: 60,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF', fontSize: '0.75rem' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF', fontSize: '0.75rem' }}
                    tickFormatter={(value) => (value / 100000000).toFixed(1) + "億"}
                    label={{ 
                      value: '資産評価額（億円）', 
                      angle: -90, 
                      position: 'outside',
                      fill: '#9CA3AF',
                      fontSize: '0.75rem',
                      offset: -45
                    }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF', fontSize: '0.75rem' }}
                    tickFormatter={(value) => value.toFixed(3)}
                    label={{ 
                      value: '残存BTC', 
                      angle: 90, 
                      position: 'outside',
                      fill: '#9CA3AF',
                      fontSize: '0.75rem',
                      offset: -35
                    }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.375rem',
                    }}
                    labelStyle={{
                        color: '#9CA3AF',
                      }}
                      formatter={(value, name) => {
                        if (name === "資産評価額") {
                          return [formatJPY(value), name];
                        }
                        return [formatBTC(value), name];
                      }}
                      labelFormatter={(label) => `${label}年`}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="totalValue"
                      name="資産評価額"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="remainingBTC"
                      name="残存BTC"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default App;