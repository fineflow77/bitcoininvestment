import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Settings, HelpCircle } from "lucide-react";
import { formatYen, formatBTC } from '../../utils/formatters';
import { DEFAULTS, PriceModel } from '../../utils/constants';
import { useInvestmentSimulation, SimulationInputs } from '../../hooks/useInvestmentSimulation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const typography = {
    h1: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    h2: 'text-xl sm:text-2xl font-semibold tracking-tight',
    h3: 'text-lg sm:text-xl font-medium',
    body: 'text-sm sm:text-base font-normal',
    small: 'text-xs sm:text-sm font-normal',
};

const colors = {
    primary: 'bg-green-500 hover:bg-green-600 text-white',
    secondary: 'bg-blue-500 hover:bg-blue-600 text-white',
    accent: 'bg-amber-500 hover:bg-amber-600 text-white',
    cardBg: 'bg-gray-800',
    cardBorder: 'border border-gray-700',
    textPrimary: 'text-gray-100',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-400',
};

const TooltipIcon: React.FC<{ content: React.ReactNode }> = ({ content }) => (
    <div className="group relative inline-block ml-2">
        <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-300 cursor-help transition-colors duration-200" />
        <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-2 text-sm text-gray-300 bg-gray-800 rounded-lg shadow-lg -translate-x-1/2 left-1/2">
            {content}
        </div>
    </div>
);

const InputField: React.FC<{
    label: string;
    tooltip?: React.ReactNode;
    error?: string;
    children: React.ReactNode;
}> = ({ label, tooltip, error, children }) => (
    <div className="mb-4">
        <div className="flex items-center mb-1">
            <label className={`${typography.body} ${colors.textSecondary}`}>{label}</label>
            {tooltip && <TooltipIcon content={tooltip} />}
        </div>
        {children}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

const TOOLTIPS = {
    initialInvestmentType: "初期投資方法を選択してください。すでに保有しているBTCを指定するか、日本円で投資するかを選べます。",
    initialInvestment: "初期投資額（円）を入力してください。",
    initialBtcHolding: "すでに保有しているビットコインの量（BTC）を入力してください。",
    monthlyInvestment: "毎月積み立てる金額（円）を入力してください。",
    years: "投資を行う期間（年数）を指定します。投資期間が終了した後も2050年まで資産推移を予測します。",
    priceModel: (
        <React.Fragment>
            <p>標準モデル：HC Burgerが提唱するパワーロー方程式を基に、2039年以降滑らかに減衰し2050年で1000万ドルに到達すると仮定。ビットコインが従来の法定通貨に代わる世界的な基軸通貨になるシナリオ（ビットコインスタンダード）。</p>
            <p className="mt-2">保守的モデル：HC Burgerが提唱するパワーロー方程式を控えめに調整し、2039年以降滑らかに減衰し2050年で400万ドルに到達すると仮定。ビットコインがゴールド（金）の4倍程度の時価総額になり、価値の保存手段の定番になるシナリオ。</p>
        </React.Fragment>
    ),
    exchangeRate: "円ドルの為替レートを設定します。",
    inflationRate: "年間の物価上昇率を設定します。",
};

const InvestmentSimulator: React.FC = () => {
    const [initialInvestmentType, setInitialInvestmentType] = useState<'btc' | 'jpy'>("btc");
    const [initialInvestment, setInitialInvestment] = useState<number | string>(DEFAULTS.INITIAL_INVESTMENT);
    const [initialBtcHolding, setInitialBtcHolding] = useState<number | string>(DEFAULTS.INITIAL_BTC_HOLDING);
    const [monthlyInvestment, setMonthlyInvestment] = useState<number | string>(DEFAULTS.MONTHLY_INVESTMENT);
    const [years, setYears] = useState<number | string>(DEFAULTS.YEARS);
    const [priceModel, setPriceModel] = useState<PriceModel>(PriceModel.STANDARD);
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [exchangeRate, setExchangeRate] = useState<number | string>(DEFAULTS.EXCHANGE_RATE);
    const [inflationRate, setInflationRate] = useState<number | string>(DEFAULTS.INFLATION_RATE);

    const { results, errors, simulate } = useInvestmentSimulation();

    const runSimulation = () => {
        const inputs: SimulationInputs = {
            initialInvestmentType,
            initialInvestment: Number(initialInvestment) || 0,
            initialBtcHolding: Number(initialBtcHolding) || 0,
            monthlyInvestment: Number(monthlyInvestment) || 0,
            years: Number(years) || 0,
            priceModel,
            exchangeRate: Number(exchangeRate) || DEFAULTS.EXCHANGE_RATE,
            inflationRate: Number(inflationRate) || DEFAULTS.INFLATION_RATE,
        };
        simulate(inputs);
    };

    const chartData = useMemo(() => {
        return results.map(result => ({
            year: result.year,
            btcHeld: result.btcHeld,
            totalValue: result.totalValue,
            isInvestmentPeriod: result.isInvestmentPeriod,
        }));
    }, [results]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-900 min-h-screen text-gray-100 space-y-8">
            <div className={`${colors.cardBg} p-6 rounded-xl shadow-md ${colors.cardBorder}`}>
                <h1 className={`${typography.h1} ${colors.textPrimary} mb-6 flex items-center justify-center`}>
                    <span className="bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">ビットコイン積み立てシミュレーター</span>
                </h1>

                <div className="space-y-6">
                    <InputField label="初期投資方法" tooltip={TOOLTIPS.initialInvestmentType}>
                        <div className="flex space-x-4 mt-1">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio text-amber-500 focus:ring-amber-500"
                                    name="initialInvestmentType"
                                    value="btc"
                                    checked={initialInvestmentType === "btc"}
                                    onChange={() => setInitialInvestmentType("btc")}
                                />
                                <span className={`${typography.body} ${colors.textSecondary} ml-2`}>すでにBTC保有</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio text-amber-500 focus:ring-amber-500"
                                    name="initialInvestmentType"
                                    value="jpy"
                                    checked={initialInvestmentType === "jpy"}
                                    onChange={() => setInitialInvestmentType("jpy")}
                                />
                                <span className={`${typography.body} ${colors.textSecondary} ml-2`}>日本円で投資</span>
                            </label>
                        </div>
                    </InputField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {initialInvestmentType === "jpy" ? (
                            <InputField label="初期投資額（円）" tooltip={TOOLTIPS.initialInvestment} error={errors?.initialInvestment}>
                                <input
                                    type="number"
                                    value={initialInvestment}
                                    onChange={(e) => setInitialInvestment(e.target.value)}
                                    className="w-full bg-gray-700 p-2 rounded-md text-gray-100 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-200"
                                    step="1000"
                                    placeholder="例: 100000"
                                    aria-label="初期投資額（円）"
                                />
                            </InputField>
                        ) : (
                            <InputField label="初期保有BTC" tooltip={TOOLTIPS.initialBtcHolding} error={errors?.initialBtcHolding}>
                                <input
                                    type="number"
                                    value={initialBtcHolding}
                                    onChange={(e) => setInitialBtcHolding(e.target.value)}
                                    className="w-full bg-gray-700 p-2 rounded-md text-gray-100 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-200"
                                    step="0.00000001"
                                    placeholder="例: 0.1"
                                    aria-label="初期保有BTC"
                                />
                            </InputField>
                        )}

                        <InputField label="毎月積み立て額（円）" tooltip={TOOLTIPS.monthlyInvestment} error={errors?.monthlyInvestment}>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={monthlyInvestment}
                                    onChange={(e) => setMonthlyInvestment(e.target.value)}
                                    className="w-full bg-gray-700 p-2 rounded-md text-gray-100 pr-12 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-200"
                                    step="1000"
                                    placeholder="例: 10000"
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">円</span>
                            </div>
                        </InputField>

                        <InputField label="積み立て年数" tooltip={TOOLTIPS.years} error={errors?.years}>
                            <input
                                type="number"
                                value={years}
                                onChange={(e) => setYears(e.target.value)}
                                className="w-full bg-gray-700 p-2 rounded-md text-gray-100 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-200"
                                step="1"
                                placeholder="例: 10"
                            />
                        </InputField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="価格予測モデル" tooltip={TOOLTIPS.priceModel}>
                            <select
                                value={priceModel}
                                onChange={(e) => setPriceModel(e.target.value as PriceModel)}
                                className="w-full bg-gray-700 p-2 rounded-md text-gray-100 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-200"
                            >
                                <option value={PriceModel.STANDARD}>標準モデル</option>
                                <option value={PriceModel.CONSERVATIVE}>保守的モデル</option>
                            </select>
                        </InputField>
                    </div>

                    <div className="mt-4">
                        <div
                            className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${showAdvancedOptions ? 'bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                        >
                            <div className="flex items-center space-x-2">
                                <Settings size={18} className={colors.textSecondary} />
                                <span className={`${typography.body} ${colors.textSecondary}`}>詳細設定</span>
                            </div>
                            {showAdvancedOptions ? (
                                <ChevronUp size={18} className={colors.textPrimary} />
                            ) : (
                                <ChevronDown size={18} className={colors.textSecondary} />
                            )}
                        </div>
                        {showAdvancedOptions && (
                            <div className="mt-4 space-y-4 p-4 bg-gray-700 rounded-md">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="為替レート (円/USD)" tooltip={TOOLTIPS.exchangeRate} error={errors?.exchangeRate}>
                                        <input
                                            type="number"
                                            value={exchangeRate}
                                            onChange={(e) => setExchangeRate(e.target.value)}
                                            className="w-full bg-gray-600 p-2 rounded-md text-gray-100 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-200"
                                            step="0.1"
                                            placeholder="例: 150"
                                        />
                                    </InputField>
                                    <InputField label="インフレ率 (%)" tooltip={TOOLTIPS.inflationRate} error={errors?.inflationRate}>
                                        <input
                                            type="number"
                                            value={inflationRate}
                                            onChange={(e) => setInflationRate(e.target.value)}
                                            className="w-full bg-gray-600 p-2 rounded-md text-gray-100 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-200"
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
                            onClick={runSimulation}
                            className={`${colors.accent} w-full p-3 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-50 shadow-md flex justify-center items-center`}
                        >
                            シミュレーション実行
                        </button>
                    </div>
                </div>

                {errors?.simulation && (
                    <div className="mt-4 p-3 bg-red-900 text-gray-100 rounded-md">{errors.simulation}</div>
                )}
            </div>

            {results && results.length > 0 && (
                <div className="mt-8 space-y-6">
                    <div className={`${colors.cardBg} p-6 rounded-xl shadow-md ${colors.cardBorder}`}>
                        <h2 className={`${typography.h2} ${colors.textPrimary} mb-4`}>資産推移</h2>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4A4A5A" />
                                <XAxis dataKey="year" stroke="#e2e8f0" tick={{ fontSize: 12, fill: '#e2e8f0' }} />
                                <YAxis
                                    yAxisId="left"
                                    stroke="#34D399"
                                    tickFormatter={(value: number) => formatBTC(value, 4)}
                                    tick={{ fill: '#e2e8f0' }}
                                    domain={['auto', 'auto']}
                                    label={{
                                        value: 'BTC保有量',
                                        angle: -90,
                                        position: 'insideLeft',
                                        style: { fill: '#34D399', fontSize: 12, fontWeight: 500 }
                                    }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    stroke="#60A5FA"
                                    tickFormatter={(value: number) => formatYen(value, 2)}
                                    tick={{ fill: '#e2e8f0' }}
                                    domain={['auto', 'auto']}
                                    label={{
                                        value: '資産評価額',
                                        angle: 90,
                                        position: 'insideRight',
                                        style: { fill: '#60A5FA', fontSize: 12, fontWeight: 500 }
                                    }}
                                    width={80}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(26, 32, 44, 0.95)', border: '1px solid rgba(82, 82, 91, 0.8)', borderRadius: '8px' }}
                                    labelStyle={{ color: '#e2e8f0' }}
                                    formatter={(value: number, name: string) => {
                                        if (name === "btcHeld") return [formatBTC(value, 4), "BTC保有量"];
                                        if (name === "totalValue") return [formatYen(value, 2), "資産評価額"];
                                        return [value, name];
                                    }}
                                />
                                <Legend wrapperStyle={{ color: '#e2e8f0' }} verticalAlign="top" height={36} />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="btcHeld"
                                    name="BTC保有量"
                                    stroke="#34D399"
                                    dot={false}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="totalValue"
                                    name="資産評価額"
                                    stroke="#60A5FA"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className={`block md:hidden ${colors.cardBg} p-4 rounded-xl shadow-md space-y-3`}>
                        <h3 className={`${typography.h3} ${colors.textPrimary} mb-2`}>ハイライト</h3>
                        <div className="bg-gray-700 p-3 rounded-md">
                            <div className={`${typography.small} ${colors.textMuted}`}>初期投資額</div>
                            <div className={`${typography.body} ${colors.textPrimary}`}>
                                {initialInvestmentType === "jpy"
                                    ? formatYen(Number(initialInvestment) || 0, 2)
                                    : formatBTC(Number(initialBtcHolding) || 0, 4)}
                            </div>
                        </div>
                        <div className="bg-gray-700 p-3 rounded-md">
                            <div className={`${typography.small} ${colors.textMuted}`}>月額積立金</div>
                            <div className={`${typography.body} ${colors.textPrimary}`}>
                                {formatYen(Number(monthlyInvestment) || 0, 2)}
                            </div>
                        </div>
                        <div className="bg-gray-700 p-3 rounded-md">
                            <div className={`${typography.small} ${colors.textMuted}`}>最終BTC保有量</div>
                            <div className={`${typography.body} ${colors.textPrimary}`}>
                                {results.length > 0 ? formatBTC(results[results.length - 1].btcHeld, 4) : "N/A"}
                            </div>
                        </div>
                        <div className="bg-gray-700 p-3 rounded-md">
                            <div className={`${typography.small} ${colors.textMuted}`}>最終資産評価額</div>
                            <div className={`${typography.body} ${colors.textPrimary}`}>
                                {results.length > 0 ? formatYen(results[results.length - 1].totalValue, 2) : "N/A"}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvestmentSimulator;