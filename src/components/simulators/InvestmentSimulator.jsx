import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChevronDown, ChevronUp, Settings, HelpCircle } from "lucide-react";

// 大きな数値の場合は単位を変換する (例: 10000000 → 1000万)
const formatCurrency = (value) => {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(2)}億円`;
  } else if (value >= 10000) {
    return `${(value / 10000).toFixed(0)}万円`;
  } else {
    return value.toLocaleString("ja-JP", { style: "currency", currency: "JPY" });
  }
};

// BTC表示の最適化 (保有量に応じて小数点以下の桁数を調整)
const formatBTC = (value) => {
  if (value >= 1) {
    return `${value.toFixed(2)} BTC`;
  } else if (value >= 0.001) {
    return `${value.toFixed(4)} BTC`;
  } else {
    return `${value.toFixed(6)} BTC`;
  }
};

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
    <div className="mb-4">
      <div className="flex items-center mb-1">
        <label className="text-gray-300 font-medium text-sm">{label}</label>
        {tooltip && <TooltipIcon content={tooltip} />}
      </div>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

const DEFAULTS = {
  EXCHANGE_RATE: 150,
  INFLATION_RATE: 0,
};

const START_YEAR = 2009;
const TRANSITION_START_YEAR = 2039; // 緩和開始年
const TARGET_YEAR = 2050; // 目標年
const CURRENT_YEAR = new Date().getFullYear();

const TOOLTIPS = {
  initialInvestmentType: "初期投資方法を選択してください。すでに保有しているBTCを指定するか、日本円で投資するかを選べます。",
  initialInvestment: "初期投資額（円）を入力してください。",
  initialBtcHolding: "すでに保有しているビットコインの量（BTC）を入力してください。",
  monthlyInvestment: "毎月積み立てる金額（円）を入力してください。",
  years: "投資を行う期間（年数）を指定します。投資期間が終了した後も2050年まで資産推移を予測します。",
  priceModel: "標準モデル：HC Burgerが提唱するパワーロー方程式を基に、2039年以降滑らかに減衰し2050年で1000万ドルに到達すると仮定。ビットコインが従来の法定通貨に代わる世界的な基軸通貨になるシナリオ（ビットコインスタンダード）。\保守的モデル：HC Burgerが提唱するパワーロー方程式を控えめに調整し、2039年以降滑らかに減衰し2050年で400万ドルに到達すると仮定。ビットコインがゴールド（金）の4倍程度の時価総額になり、価値の保存手段の定番になるシナリオ。",
  exchangeRate: "円ドルの為替レートを設定します。",
  inflationRate: "年間の物価上昇率を設定します。",
};

const btcPriceMedian = (days, model = "standard") => {
  if (days <= 0) return 1;
  const k = model === "standard" ? 5.84509376 : 5.75;
  return Math.pow(10, -17.01593313 + k * Math.log10(days));
};

const calculateDays = (year) => {
  const startDate = new Date("2009-01-03");
  const endDate = new Date(year, 11, 31);
  const diffTime = endDate - startDate;
  return Math.max(diffTime / (1000 * 60 * 60 * 24), 1);
};

const InvestmentSimulator = () => {
  const [initialInvestmentType, setInitialInvestmentType] = useState("btc"); // "btc" or "jpy"
  const [initialInvestment, setInitialInvestment] = useState("");
  const [initialBtcHolding, setInitialBtcHolding] = useState("");
  const [monthlyInvestment, setMonthlyInvestment] = useState("");
  const [years, setYears] = useState("10");
  const [priceModel, setPriceModel] = useState("standard");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(DEFAULTS.EXCHANGE_RATE.toString());
  const [inflationRate, setInflationRate] = useState(DEFAULTS.INFLATION_RATE.toString());
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    const newErrors = {};

    if (initialInvestmentType === "jpy") {
      if (initialInvestment === "" || isNaN(parseFloat(initialInvestment)) || parseFloat(initialInvestment) < 0)
        newErrors.initialInvestment = "0以上の値を入力してください";
    } else { // btc
      if (initialBtcHolding === "" || isNaN(parseFloat(initialBtcHolding)) || parseFloat(initialBtcHolding) < 0)
        newErrors.initialBtcHolding = "0以上の値を入力してください";
    }

    if (!monthlyInvestment || isNaN(parseFloat(monthlyInvestment)) || parseFloat(monthlyInvestment) <= 0)
      newErrors.monthlyInvestment = "有効な値を入力してください";

    if (!years || isNaN(parseInt(years)) || parseInt(years) <= 0 || parseInt(years) > 50)
      newErrors.years = "1～50年で入力してください";

    if (parseFloat(exchangeRate) <= 0)
      newErrors.exchangeRate = "0より大きくしてください";

    if (parseFloat(inflationRate) < 0) newErrors.inflationRate = "0%以上で入力してください";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const simulate = () => {
    if (!validateInputs()) return;
    try {
      const simulationResults = [];
      const exchangeRateNum = parseFloat(exchangeRate);
      const inflationRateNum = parseFloat(inflationRate) / 100;
      const monthlyInvestmentNum = parseFloat(monthlyInvestment);
      const yearsNum = parseInt(years);
      const startYear = new Date().getFullYear();
      const endYear = Math.max(TARGET_YEAR, startYear + yearsNum);
      let basePriceUSD = null;
      let baseDays = null;

      for (let year = startYear; year <= endYear; year++) {
        const isInvestmentPeriod = year < startYear + yearsNum;
        const days = calculateDays(year);

        let btcPriceUSD = btcPriceMedian(days, priceModel);
        if (year >= TRANSITION_START_YEAR) {
          if (!basePriceUSD) {
            basePriceUSD = btcPriceMedian(calculateDays(TRANSITION_START_YEAR - 1), priceModel); // 2038年末基準
            baseDays = calculateDays(TRANSITION_START_YEAR - 1);
          }
          const targetScale = priceModel === "standard" ? 0.41 : 0.5;
          const decayRate = priceModel === "standard" ? 0.2 : 0.25; // 減衰率を調整
          const scale = targetScale + (1.0 - targetScale) * Math.exp(-decayRate * (year - (TRANSITION_START_YEAR - 1)));
          btcPriceUSD = basePriceUSD * Math.pow(btcPriceMedian(days, priceModel) / btcPriceMedian(baseDays, priceModel), scale);
        }

        if (!btcPriceUSD || btcPriceUSD <= 0) btcPriceUSD = 1;

        const effectiveExchangeRate = exchangeRateNum * Math.pow(1 + inflationRateNum, year - startYear);
        const btcPriceJPY = btcPriceUSD * effectiveExchangeRate;

        // 投資期間内かどうかを判定
        const annualInvestment = isInvestmentPeriod ? monthlyInvestmentNum * 12 : 0;
        const btcPurchased = annualInvestment / btcPriceJPY;

        simulationResults.push({
          year,
          btcPrice: btcPriceJPY,
          annualInvestment,
          btcPurchased,
          btcHeld: (simulationResults.length > 0 ? simulationResults[simulationResults.length - 1].btcHeld : parseFloat(initialBtcHolding) || 0) + btcPurchased,
          totalValue: ((simulationResults.length > 0 ? simulationResults[simulationResults.length - 1].btcHeld : parseFloat(initialBtcHolding) || 0) + btcPurchased) * btcPriceJPY,
          isInvestmentPeriod, // 投資期間フラグ
        });
      }

      setResults(simulationResults);
      setErrors({});
    } catch (err) {
      setErrors({ simulation: "シミュレーション中にエラーが発生しました: " + err.message });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-white text-center mb-6">ビットコイン積み立てシミュレーター</h1>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="初期投資方法" tooltip={TOOLTIPS.initialInvestmentType}>
              <div className="flex space-x-4 mt-1">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-500"
                    name="initialInvestmentType"
                    value="btc"
                    checked={initialInvestmentType === "btc"}
                    onChange={() => setInitialInvestmentType("btc")}
                  />
                  <span className="ml-2 text-gray-300">すでにBTC保有</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-500"
                    name="initialInvestmentType"
                    value="jpy"
                    checked={initialInvestmentType === "jpy"}
                    onChange={() => setInitialInvestmentType("jpy")}
                  />
                  <span className="ml-2 text-gray-300">日本円で投資</span>
                </label>
              </div>
            </InputField>

            {initialInvestmentType === "jpy" ? (
              <InputField label="初期投資額（円）" tooltip={TOOLTIPS.initialInvestment} error={errors.initialInvestment}>
                <input
                  type="number"
                  value={initialInvestment}
                  onChange={(e) => setInitialInvestment(e.target.value)}
                  className="w-full bg-gray-700 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  step="1000"
                  placeholder="例: 100000"
                />
              </InputField>
            ) : (
              <InputField label="初期保有BTC" tooltip={TOOLTIPS.initialBtcHolding} error={errors.initialBtcHolding}>
                <input
                  type="number"
                  value={initialBtcHolding}
                  onChange={(e) => setInitialBtcHolding(e.target.value)}
                  className="w-full bg-gray-700 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  step="0.00000001"
                  placeholder="例: 0.1"
                />
              </InputField>
            )}

            <InputField label="投資年数" tooltip={TOOLTIPS.years} error={errors.years}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="価格予測モデル" tooltip={TOOLTIPS.priceModel}>
              <select
                value={priceModel}
                onChange={(e) => setPriceModel(e.target.value)}
                className="w-full bg-gray-700 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="standard">標準モデル</option>
                <option value="conservative">保守的モデル</option>
              </select>
            </InputField>
          </div>

          <div className="mt-4">
            <div
              className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${showAdvancedOptions ? 'bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              <div className="flex items-center space-x-2">
                <Settings size={18} className="text-gray-300" />
                <span className="text-white font-medium text-sm">詳細設定</span>
              </div>
              {showAdvancedOptions ? <ChevronUp size={18} className="text-white" /> : <ChevronDown size={18} className="text-gray-300" />}
            </div>
            {showAdvancedOptions && (
              <div className="mt-4 space-y-4 p-4 bg-gray-700 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="為替レート (円/USD)">
                    <input
                      type="number"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(e.target.value)}
                      className="w-full bg-gray-600 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      step="0.1"
                      placeholder="例: 150"
                    />
                  </InputField>
                  <InputField label="インフレ率 (%)">
                    <input
                      type="number"
                      value={inflationRate}
                      onChange={(e) => setInflationRate(e.target.value)}
                      className="w-full bg-gray-600 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      step="0.1"
                      placeholder="例: 0"
                    />
                  </InputField>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={simulate}
              className="w-full bg-blue-500 p-3 rounded-md text-white text-lg font-semibold hover:bg-blue-600 hover:scale-105 transition-transform duration-200"
            >
              シミュレーション実行
            </button>
          </div>
        </div>

        {errors.simulation && (
          <div className="mt-4 p-3 bg-red-900 text-white rounded-md">
            {errors.simulation}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-8 space-y-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-white mb-4">資産推移</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={results} margin={{ top: 20, right: 40, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" stroke="#FFFFFF" tick={{ fill: '#FFFFFF' }} />
                  <YAxis yAxisId="left" stroke="#34D399" tick={{ fill: '#FFFFFF' }}
                    label={{ value: 'BTC保有量', angle: -90, position: 'insideLeft', offset: -10, style: { fill: '#34D399', fontSize: 12 } }}
                    tickFormatter={(value) => value < 0.1 ? value.toFixed(3) : value < 1 ? value.toFixed(2) : value.toFixed(1)} tickCount={5} />
                  <YAxis yAxisId="right" orientation="right" stroke="#60A5FA" tick={{ fill: '#FFFFFF' }}
                    label={{ value: '資産評価額 (JPY)', angle: 90, position: 'insideRight', offset: 10, style: { fill: '#60A5FA', fontSize: 12 } }}
                    tickFormatter={(value) => value >= 100000000 ? `${(value / 100000000).toFixed(0)}億` : value >= 10000 ? `${(value / 10000).toFixed(0)}万` : value.toLocaleString()}
                    width={80} tickCount={5} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#FFFFFF' }}
                    labelStyle={{ color: '#FFFFFF' }}
                    itemStyle={{ color: '#FFFFFF' }}
                    formatter={(value, name) => name === "BTC保有量" ? [formatBTC(value), name] : [formatCurrency(value), name]} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#FFFFFF' }} />
                  <Line yAxisId="left" type="monotone" dataKey="btcHeld" name="BTC保有量" stroke="#34D399" dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="totalValue" name="資産評価額" stroke="#60A5FA" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg overflow-x-auto">
              <div className="flex justify-between mb-2">
                <h3 className="text-md font-semibold text-white">シミュレーション結果</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 mr-2"></div>
                    <span className="text-xs text-white">積立終了ライン</span>
                  </div>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-700 z-10">
                  <tr className="text-left border-b border-gray-600">
                    <th className="p-2 whitespace-nowrap text-white font-medium">年</th>
                    <th className="p-2 whitespace-nowrap text-white font-medium">1BTC価格</th>
                    <th className="p-2 whitespace-nowrap text-white font-medium">年間投資額</th>
                    <th className="p-2 whitespace-nowrap text-white font-medium">追加BTC量</th>
                    <th className="p-2 whitespace-nowrap text-white font-medium">BTC保有量</th>
                    <th className="p-2 whitespace-nowrap text-white font-medium">資産評価額</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr
                      key={index}
                      className={`${index % 2 === 0 ? "bg-gray-800" : "bg-gray-700"} ${result.isInvestmentPeriod ? 'text-white' : 'text-gray-500'}`}
                    >
                      <td className="p-2 whitespace-nowrap">
                        {result.year}
                        {result.isInvestmentPeriod && isEndOfInvestmentPeriod &&
                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-yellow-500 text-yellow-100 rounded">
                            積立終了
                          </span>
                        }
                      </td>
                      <td className="p-2 whitespace-nowrap text-gray-100">{formatCurrency(result.btcPrice)}</td>
                      <td className="p-2 whitespace-nowrap text-gray-100">{formatCurrency(result.annualInvestment)}</td>
                      <td className="p-2 whitespace-nowrap text-gray-100">{formatBTC(result.btcPurchased)}</td>
                      <td className="p-2 whitespace-nowrap text-gray-100">{formatBTC(result.btcHeld)}</td>
                      <td className="p-2 whitespace-nowrap text-gray-100">{formatCurrency(result.totalValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {/* フッター追加 */}
      <footer className="text-center text-gray-400 mt-8 py-4 border-t border-gray-800">
        <p>
          © {new Date().getFullYear()} BTCパワーロー博士{' '}
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
  );
};

export default InvestmentSimulator;