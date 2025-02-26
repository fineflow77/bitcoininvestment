import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChevronDown, ChevronUp, Settings, HelpCircle } from "lucide-react";

// ユーティリティ関数 (別ファイルに切り出すことも検討)
const formatCurrency = (value) => {
  if (value >= 100000000) return `${(value / 100000000).toFixed(2)}億円`;
  if (value >= 10000) return `${(value / 10000).toFixed(0)}万円`;
  return value.toLocaleString("ja-JP", { style: "currency", currency: "JPY" });
};
const formatBTC = (value) => {
  if (value >= 1) return `${value.toFixed(2)} BTC`;
  if (value >= 0.001) return `${value.toFixed(4)} BTC`;
  return `${value.toFixed(6)} BTC`;
};
const formatPercent = (value) => (value === "-" ? "-" : `${parseFloat(value).toFixed(2)}%`);

// ツールチップアイコンコンポーネント (共通コンポーネントとして別ファイルに切り出すことも検討)
const TooltipIcon = ({ content }) => (
  <div className="group relative inline-block ml-2">
    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-300 cursor-help" />
    <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-2 text-sm text-gray-300 bg-gray-800 rounded-lg shadow-lg">{content}</div>
  </div>
);

// インプットフィールドコンポーネント (共通コンポーネントとして別ファイルに切り出すことも検討)
const InputField = ({ label, tooltip, error, children }) => (
  <div className="mb-4">
    <div className="flex items-center mb-1">
      <label className="text-gray-300 font-medium text-sm">{label}</label>
      {tooltip && <TooltipIcon content={tooltip} />}
    </div>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// 定数 (constants.js など別ファイルに切り出すことも検討)
const DEFAULTS = { EXCHANGE_RATE: 150, INFLATION_RATE: 0 };
const START_YEAR = 2009;
const TRANSITION_START_YEAR = 2039;
const TARGET_YEAR = 2050;
const CURRENT_YEAR = new Date().getFullYear();
const TOOLTIPS = {
  initialInvestmentType: "初期投資方法を選択してください。すでに保有しているBTCを指定するか、日本円で投資するかを選べます。",
  initialInvestment: "初期投資額（円）を入力してください。",
  initialBtcHolding: "すでに保有しているビットコインの量（BTC）を入力してください。",
  monthlyInvestment: "毎月積み立てる金額（円）を入力してください。",
  years: "投資を行う期間（年数）を指定します。投資期間が終了した後も2050年まで資産推移を予測します。",
  priceModel: <React.Fragment>
    <p>標準モデル：HC Burgerが提唱するパワーロー方程式を基に、2039年以降滑らかに減衰し2050年で1000万ドルに到達すると仮定。ビットコインが従来の法定通貨に代わる世界的な基軸通貨になるシナリオ（ビットコインスタンダード）。</p>
    <p className="mt-2">保守的モデル：HC Burgerが提唱するパワーロー方程式を控えめに調整し、2039年以降滑らかに減衰し2050年で400万ドルに到達すると仮定。ビットコインがゴールド（金）の4倍程度の時価総額になり、価値の保存手段の定番になるシナリオ。</p>
  </React.Fragment>,
  exchangeRate: "円ドルの為替レートを設定します。",
  inflationRate: "年間の物価上昇率を設定します。",
};

// 価格予測モデル関数 (models.js など別ファイルに切り出すことも検討)
const btcPriceMedian = (days, model = "standard") => {
  const k = model === "standard" ? 5.84509376 : 5.75;
  return Math.pow(10, -17.01593313 + k * Math.log10(Math.max(days, 1))); // Math.max で days が 0 以下にならないように修正
};
const calculateDays = (year) => Math.max(Math.floor((new Date(year, 11, 31) - new Date("2009-01-03")) / (1000 * 60 * 60 * 24)), 1); // Math.max で days が 0 以下にならないように修正


const InvestmentSimulator = () => {
  // State 変数
  const [initialInvestmentType, setInitialInvestmentType] = useState("btc");
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

  // 入力値検証関数
  const validateInputs = () => {
    const newErrors = {};

    if (initialInvestmentType === "jpy") {
      if (!initialInvestment || isNaN(parseFloat(initialInvestment)) || parseFloat(initialInvestment) < 0)
        newErrors.initialInvestment = "0以上の値を入力してください";
    } else {
      if (!initialBtcHolding || isNaN(parseFloat(initialBtcHolding)) || parseFloat(initialBtcHolding) < 0)
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

  // シミュレーション実行関数
  const simulate = () => {
    if (!validateInputs()) return;
    try {
      const simulationResults = [];
      const exchangeRateNum = parseFloat(exchangeRate);
      const inflationRateNum = parseFloat(inflationRate) / 100;
      const monthlyInvestmentNum = parseFloat(monthlyInvestment);
      const yearsNum = parseInt(years);
      const startYear = CURRENT_YEAR;
      const endYear = Math.max(TARGET_YEAR, startYear + yearsNum);
      let basePriceUSD = null;
      let baseDays = null;
      let btcHeld = initialInvestmentType === "jpy" ? 0 : parseFloat(initialBtcHolding) || 0; // 初期BTC保有量設定
      let initialInvestmentValue = initialInvestmentType === "jpy" ? parseFloat(initialInvestment) || 0 : 0; // 初期投資額設定

      // 初年度のBTC価格を計算 (シミュレーション開始年の価格を基準とする)
      const initialDays = calculateDays(startYear);
      const initialBtcPriceUSD = btcPriceMedian(initialDays, priceModel);
      const initialExchangeRate = exchangeRateNum;
      const initialBtcPriceJPY = initialBtcPriceUSD * initialExchangeRate;

      if (initialInvestmentType === "jpy") {
        btcHeld = initialInvestmentValue / initialBtcPriceJPY; // 初期投資額から初期BTC保有量を計算
      }


      let currentValueJPY = btcHeld * initialBtcPriceJPY;
      let previousBtcHeld = btcHeld;


      for (let year = startYear; year <= endYear; year++) {
        const isInvestmentPeriod = year < startYear + yearsNum;
        const days = calculateDays(year);
        const btcPriceUSD = btcPriceMedian(days, priceModel, basePriceUSD, baseDays, TRANSITION_START_YEAR); // 修正：価格予測モデル関数に basePriceUSD, baseDays, TRANSITION_START_YEAR を渡す
        const effectiveExchangeRate = exchangeRateNum * Math.pow(1 + inflationRateNum, year - startYear);
        const btcPriceJPY = btcPriceUSD * effectiveExchangeRate;
        const annualInvestment = isInvestmentPeriod ? monthlyInvestmentNum * 12 : 0;
        const btcPurchased = annualInvestment / btcPriceJPY;
        btcHeld += btcPurchased;
        const addedBtc = btcHeld - previousBtcHeld;
        previousBtcHeld = btcHeld;
        currentValueJPY = btcHeld * btcPriceJPY;


        simulationResults.push({
          year, btcPrice: btcPriceJPY, annualInvestment, btcPurchased: addedBtc, btcHeld, totalValue: currentValueJPY, isInvestmentPeriod
        });
      }
      setResults(simulationResults);
      setErrors({});
    } catch (err) {
      setErrors({ simulation: "シミュレーション中にエラーが発生しました: " + err.message });
    }
  };


  const chartData = useMemo(() => {
    return results.map(result => ({
      year: result.year,
      btcHeld: result.btcHeld,
      totalValue: result.totalValue,
      isInvestmentPeriod: result.isInvestmentPeriod, // 投資期間フラグを渡す
    }));
  }, [results]);


  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-white text-center mb-6">ビットコイン積み立てシミュレーター</h1>

        <div className="space-y-6">
          <InputField label="初期投資方法" tooltip={TOOLTIPS.initialInvestmentType}>
            <div className="flex space-x-4 mt-1">
              <label className="inline-flex items-center"><input type="radio" className="form-radio text-blue-500" name="initialInvestmentType" value="btc" checked={initialInvestmentType === "btc"} onChange={(e) => setInitialInvestmentType("btc")} /><span className="ml-2 text-gray-300">すでにBTC保有</span></label>
              <label className="inline-flex items-center"><input type="radio" className="form-radio text-blue-500" name="initialInvestmentType" value="jpy" checked={initialInvestmentType === "jpy"} onChange={() => setInitialInvestmentType("jpy")} /><span className="ml-2 text-gray-300">日本円で投資</span></label>
            </div>
          </InputField>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {initialInvestmentType === "jpy" ? <InputField label="初期投資額（円）" tooltip={TOOLTIPS.initialInvestment} error={errors.initialInvestment}>
              <input type="number" value={initialInvestment} onChange={(e) => setInitialInvestment(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" step="1000" placeholder="例: 100000" />
            </InputField> : <InputField label="初期保有BTC" tooltip={TOOLTIPS.initialBtcHolding} error={errors.initialBtcHolding}>
              <input type="number" value={initialBtcHolding} onChange={(e) => setInitialBtcHolding(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" step="0.00000001" placeholder="例: 0.1" />
            </InputField>}

            <InputField label="毎月積み立て額（円）" tooltip={TOOLTIPS.monthlyInvestment} error={errors.monthlyInvestment}>
              <div className="relative"><input type="number" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white pr-12 focus:ring-2 focus:ring-blue-500 focus:outline-none" step="1000" placeholder="例: 10000" /><span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">円</span></div>
            </InputField>

            <InputField label="積み立て年数" tooltip={TOOLTIPS.years} error={errors.years}>
              <input type="number" value={years} onChange={(e) => setYears(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" step="1" placeholder="例: 10" />
            </InputField>
          </div>

          <div className="mt-4">
            <div className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${showAdvancedOptions ? 'bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`} onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>
              <div className="flex items-center space-x-2"><Settings size={18} className="text-gray-300" /><span className="text-white font-medium text-sm">詳細設定</span></div>
              {showAdvancedOptions ? <ChevronUp size={18} className="text-white" /> : <ChevronDown size={18} className="text-gray-300" />}
            </div>
            {showAdvancedOptions && (
              <div className="mt-4 space-y-4 p-4 bg-gray-700 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="為替レート (円/USD)">
                    <input type="number" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} className="w-full bg-gray-600 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" step="0.1" placeholder="例: 150" />
                  </InputField>
                  <InputField label="インフレ率 (%)">
                    <input type="number" value={inflationRate} onChange={(e) => setInflationRate(e.target.value)} className="w-full bg-gray-600 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" step="0.1" placeholder="例: 0" />
                  </InputField>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button onClick={simulate} className="w-full bg-blue-500 p-3 rounded-md text-white text-lg font-semibold hover:bg-blue-600 hover:scale-105 transition-transform duration-200">シミュレーション実行</button>
          </div>
        </div>

        {errors.simulation && <div className="mt-4 p-3 bg-red-900 text-white rounded-md">{errors.simulation}</div>}

        {results.length > 0 && (
          <div className="mt-8 space-y-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-white mb-4">資産推移</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" stroke="#9CA3AF" />
                  <YAxis yAxisId="left" stroke="#34D399" label={{ value: 'BTC保有量', angle: -90, position: 'insideLeft', style: { fill: '#34D399' } }} tickFormatter={formatBTC} />
                  <YAxis yAxisId="right" orientation="right" stroke="#60A5FA" label={{ value: '資産評価額', angle: 90, position: 'insideRight', style: { fill: '#60A5FA' } }} tickFormatter={formatCurrency} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                    labelStyle={{ color: '#9CA3AF' }}
                    formatter={(value, name) => name === "btcHeld" ? [formatBTC(value), name] : [formatCurrency(value), name]} />
                  <Legend verticalAlign="top" height={36} />
                  <Line yAxisId="left" type="monotone" dataKey="btcHeld" name="BTC保有量" stroke="#34D399" dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="totalValue" name="資産評価額" stroke="#60A5FA" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg overflow-x-auto">
              <h3 className="text-md font-semibold text-white mb-2">シミュレーション結果</h3>
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-700 z-10">
                  <tr className="text-left border-b border-gray-600">
                    <th className="p-2 whitespace-nowrap text-gray-300">年</th>
                    <th className="p-2 whitespace-nowrap text-gray-300">1BTC価格</th>
                    <th className="p-2 whitespace-nowrap text-gray-300">年間投資額</th>
                    <th className="p-2 whitespace-nowrap text-gray-300">追加BTC量</th>
                    <th className="p-2 whitespace-nowrap text-gray-300">BTC保有量</th>
                    <th className="p-2 whitespace-nowrap text-gray-300">資産評価額</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-800" : "bg-gray-700"}>
                      <td className="p-2 whitespace-nowrap text-gray-100">{result.year}</td>
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