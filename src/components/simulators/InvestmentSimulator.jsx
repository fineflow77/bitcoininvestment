import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChevronDown, ChevronUp, Settings, HelpCircle } from "lucide-react";
import { STANDARD_PRICE_MODEL, CONSERVATIVE_PRICE_MODEL } from "../../constants/priceModels";
import { formatCurrency, formatBTC } from "../../utils/formatters";

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

const InputField = ({ label, tooltip, error, children }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <label className="text-gray-300 font-medium">{label}</label>
        {tooltip && <TooltipIcon content={tooltip} />}
      </div>
      {children}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

const DEFAULTS = {
  EXCHANGE_RATE: 150,
  INFLATION_RATE: 0,
};

const CURRENT_YEAR = new Date().getFullYear();

const TOOLTIPS = {
  initialBTC: "現在保有しているビットコインの量を入力してください。0でも可。",
  monthlyInvestment: "毎月積み立てる金額（円）を入力してください。",
  years: "積み立てを行う期間（年数）を指定します。",
  exchangeRate: "円ドルの為替レートを設定します。",
  inflationRate: "年間の物価上昇率を設定します。",
};



const BTCAccumulationSimulator = () => {
  const [initialBTC, setInitialBTC] = useState("0");
  const [monthlyInvestment, setMonthlyInvestment] = useState("");
  const [years, setYears] = useState("10");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(DEFAULTS.EXCHANGE_RATE.toString());
  const [inflationRate, setInflationRate] = useState(DEFAULTS.INFLATION_RATE.toString());
  const [priceModel, setPriceModel] = useState("standard");
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    const newErrors = {};
    if (isNaN(parseFloat(initialBTC)) || parseFloat(initialBTC) < 0) newErrors.initialBTC = "保有BTCは0以上の数値を入力してください";
    if (!monthlyInvestment || isNaN(parseFloat(monthlyInvestment)) || parseFloat(monthlyInvestment) <= 0) newErrors.monthlyInvestment = "毎月の積み立て額を正しく入力してください";
    if (!years || isNaN(parseInt(years)) || parseInt(years) <= 0) newErrors.years = "積み立て年数は1以上の整数を入力してください";
    if (parseFloat(exchangeRate) <= 0) newErrors.exchangeRate = "為替レートは0より大きい値を入力してください";
    if (parseFloat(inflationRate) < 0) newErrors.inflationRate = "インフレ率は0%以上で入力してください";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const simulate = () => {
    if (!validateInputs()) return;
    try {
      const selectedModel = priceModel === "standard" ? STANDARD_PRICE_MODEL : CONSERVATIVE_PRICE_MODEL;
      let currentBTC = parseFloat(initialBTC);
      const simulationResults = [];
      const exchangeRateNum = parseFloat(exchangeRate);
      const inflationRateNum = parseFloat(inflationRate) / 100;
      const monthlyInvestmentNum = parseFloat(monthlyInvestment);
      const yearsNum = parseInt(years);

      for (let year = CURRENT_YEAR; year < CURRENT_YEAR + yearsNum; year++) {
        const btcPriceUSD = selectedModel[year] || selectedModel[CURRENT_YEAR];
        const btcPriceJPY = btcPriceUSD * exchangeRateNum;
        const annualInvestment = monthlyInvestmentNum * 12;
        const btcPurchased = annualInvestment / btcPriceJPY;

        currentBTC += btcPurchased;
        const totalValue = currentBTC * btcPriceJPY;

        simulationResults.push({
          year,
          btcPrice: btcPriceJPY,
          annualInvestment,
          accumulatedBTC: currentBTC,
          totalValue,
        });
      }

      setResults(simulationResults);
      setErrors({});
    } catch (err) {
      setErrors({ simulation: "シミュレーション中にエラーが発生しました: " + err.message });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          ビットコイン積み立てシミュレーター
        </h1>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="初期保有BTC" tooltip={TOOLTIPS.initialBTC} error={errors.initialBTC}>
              <input
                type="number"
                value={initialBTC}
                onChange={(e) => setInitialBTC(e.target.value)}
                className="w-full bg-gray-700 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                step="0.00000001"
                placeholder="例: 0"
              />
            </InputField>
            <InputField label="毎月積み立て額（円）" tooltip={TOOLTIPS.monthlyInvestment} error={errors.monthlyInvestment}>
              <input
                type="number"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(e.target.value)}
                className="w-full bg-gray-700 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                step="1000"
                placeholder="例: 10000"
              />
            </InputField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="積み立て年数" tooltip={TOOLTIPS.years} error={errors.years}>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full bg-gray-700 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                step="1"
                placeholder="例: 10"
              />
            </InputField>
          </div>

          <div className="mt-6">
            <div
              className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${showAdvancedOptions ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              <div className="flex items-center space-x-2">
                <Settings size={18} className="text-gray-300" />
                <span className="text-white font-medium">詳細設定</span>
              </div>
              {showAdvancedOptions ? <ChevronUp size={18} className="text-white" /> : <ChevronDown size={18} className="text-gray-300" />}
            </div>
            {showAdvancedOptions && (
              <div className="mt-4 space-y-6 p-4 bg-gray-700 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="為替レート (円/USD)" tooltip={TOOLTIPS.exchangeRate} error={errors.exchangeRate}>
                    <input
                      type="number"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(e.target.value)}
                      className="w-full bg-gray-600 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      step="0.1"
                    />
                  </InputField>
                  <InputField label="インフレ率 (%)" tooltip={TOOLTIPS.inflationRate} error={errors.inflationRate}>
                    <input
                      type="number"
                      value={inflationRate}
                      onChange={(e) => setInflationRate(e.target.value)}
                      className="w-full bg-gray-600 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      step="0.1"
                    />
                  </InputField>
                </div>
                <InputField label="価格予測モデル">
                  <select
                    value={priceModel}
                    onChange={(e) => setPriceModel(e.target.value)}
                    className="w-full bg-gray-600 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="standard">中央値モデル</option>
                    <option value="conservative">下限値モデル</option>
                  </select>
                </InputField>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={simulate}
              className="w-full bg-blue-500 p-4 rounded-md text-white text-lg font-semibold hover:bg-blue-600 hover:scale-105 transition-transform duration-200"
            >
              シミュレーション実行
            </button>
          </div>
        </div>


        {results.length > 0 && (
          <div className="mt-8 space-y-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-white mb-4">資産推移</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={results} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" stroke="#9CA3AF" />
                  <YAxis yAxisId="left" stroke="#34D399" label={{ value: '累積BTC', angle: -90, position: 'insideLeft' }} tickFormatter={(value) => formatBTC(value)} />
                  <YAxis yAxisId="right" orientation="right" stroke="#60A5FA" label={{ value: '資産評価額', angle: 90, position: 'insideRight', offset: 10, style: { fill: '#60A5FA', fontSize: '14px' } }} tickFormatter={(value) => formatCurrency(value)} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} labelStyle={{ color: '#9CA3AF' }} formatter={(value, name) => name === "累積BTC" ? [formatBTC(value), name] : [formatCurrency(value), name]} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="accumulatedBTC" name="累積BTC" stroke="#34D399" dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="totalValue" name="資産評価額" stroke="#60A5FA" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-700 z-10">
                  <tr className="text-left border-b border-gray-600">
                    <th className="p-2 whitespace-nowrap text-gray-300">年</th>
                    <th className="p-2 whitespace-nowrap text-gray-300">1BTC価格</th>
                    <th className="p-2 whitespace-nowrap text-gray-300">年間積み立て額</th>
                    <th className="p-2 whitespace-nowrap text-gray-300">累積BTC</th>
                    <th className="p-2 whitespace-nowrap text-gray-300">資産評価額</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
                      <td className="p-2 whitespace-nowrap text-gray-100">{result.year}</td>
                      <td className="p-2 whitespace-nowrap text-gray-100">{formatCurrency(result.btcPrice)}</td>
                      <td className="p-2 whitespace-nowrap text-gray-100">{formatCurrency(result.annualInvestment)}</td>
                      <td className="p-2 whitespace-nowrap text-gray-100">{formatBTC(result.accumulatedBTC)}</td>
                      <td className="p-2 whitespace-nowrap text-gray-100">{formatCurrency(result.totalValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default BTCAccumulationSimulator;