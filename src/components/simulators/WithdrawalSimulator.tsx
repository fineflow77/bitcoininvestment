import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChevronDown, ChevronUp, Settings, HelpCircle } from "lucide-react";
import { formatYen, formatBTC, formatPercentage } from '../../utils/formatters';
import { DEFAULTS, CURRENT_YEAR, PriceModel } from '../../utils/constants';
import { useWithdrawalSimulation, WithdrawalInputs } from '../../hooks/useWithdrawalSimulation';
import LoadingSpinner from '../ui/LoadingSpinner';

// Home.tsx から借用したスタイル
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

// ツールチップアイコンコンポーネント
const TooltipIcon: React.FC<{ content: React.ReactNode }> = ({ content }) => (
    <div className="group relative inline-block ml-2">
        <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-300 cursor-help transition-colors duration-200" />
        <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-2 text-sm text-gray-300 bg-gray-800 rounded-lg shadow-lg -translate-x-1/2 left-1/2">
            {content}
        </div>
    </div>
);

// インプットフィールドコンポーネント
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
    initialBTC: "現在保有しているビットコインの量を入力してください。",
    withdrawalAmount: "毎月の生活費として必要な金額を入力してください。税引き後の手取り額として計算されます。",
    withdrawalRate: "資産からの年間取り崩し率を指定します。一般的なFIREでは4%が目安とされています。",
    secondPhase: "特定の年から取り崩し方法や金額を変更できます。退職後の生活スタイルの変化などに対応します。",
    taxRate: "利益に対する税率を設定します。デフォルトは確定申告を行った場合の税率です。",
    exchangeRate: "円ドルの為替レートを設定します。",
    inflationRate: "年間の物価上昇率を設定します。",
    priceModel: (
        <React.Fragment>
            <p>標準モデル：HC Burgerが提唱するパワーロー方程式を基に、2039年以降滑らかに減衰し2050年で1000万ドルに到達すると仮定。ビットコインが従来の法定通貨に代わる世界的な基軸通貨になるシナリオ（ビットコインスタンダード）。</p>
            <p className="mt-2">保守的モデル：HC Burgerが提唱するパワーロー方程式を控えめに調整し、2039年以降滑らかに減衰し2050年で400万ドルに到達すると仮定。ビットコインがゴールド（金）の4倍程度の時価総額になり、価値の保存手段の定番になるシナリオ。</p>
        </React.Fragment>
    ),
};

const WithdrawalSimulator: React.FC = () => {
    const [initialBTC, setInitialBTC] = useState("");
    const [startYear, setStartYear] = useState("2025");
    const [priceModel, setPriceModel] = useState<PriceModel>(PriceModel.STANDARD);
    const [withdrawalType, setWithdrawalType] = useState<'fixed' | 'percentage'>("fixed");
    const [withdrawalAmount, setWithdrawalAmount] = useState("");
    const [withdrawalRate, setWithdrawalRate] = useState("4");
    const [showSecondPhase, setShowSecondPhase] = useState(false);
    const [secondPhaseYear, setSecondPhaseYear] = useState("2030");
    const [secondPhaseType, setSecondPhaseType] = useState<'fixed' | 'percentage'>("fixed");
    const [secondPhaseAmount, setSecondPhaseAmount] = useState("");
    const [secondPhaseRate, setSecondPhaseRate] = useState("4");
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [taxRate, setTaxRate] = useState(DEFAULTS.TAX_RATE.toString());
    const [exchangeRate, setExchangeRate] = useState(DEFAULTS.EXCHANGE_RATE.toString());
    const [inflationRate, setInflationRate] = useState(DEFAULTS.INFLATION_RATE.toString());
    const [isCalculating, setIsCalculating] = useState(false);

    const { results, errors, simulate } = useWithdrawalSimulation();

    const runSimulation = () => {
        setIsCalculating(true);
        const inputs: WithdrawalInputs = {
            initialBTC,
            startYear,
            priceModel,
            withdrawalType,
            withdrawalAmount,
            withdrawalRate,
            showSecondPhase,
            secondPhaseYear,
            secondPhaseType,
            secondPhaseAmount,
            secondPhaseRate,
            taxRate,
            exchangeRate,
            inflationRate
        };
        setTimeout(() => {
            simulate(inputs);
            setIsCalculating(false);
        }, 500);
    };

    const chartData = useMemo(() => {
        if (results.length > 0) {
            return results.map(result => ({
                year: result.year,
                btcHeld: result.remainingBTC,
                totalValue: result.totalValue,
            }));
        }
        return [];
    }, [results]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-900 min-h-screen text-gray-100 space-y-8">
            <div className={`${colors.cardBg} p-6 rounded-xl shadow-md ${colors.cardBorder}`}>
                <h1 className={`${typography.h1} ${colors.textPrimary} mb-6 flex items-center justify-center`}>
                    <span className="bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">ビットコイン取り崩しシミュレーター</span>
                </h1>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="保有BTC" tooltip={TOOLTIPS.initialBTC} error={errors.initialBTC}>
                            <input
                                type="number"
                                value={initialBTC}
                                onChange={(e) => setInitialBTC(e.target.value)}
                                className="w-full bg-gray-700 p-2 rounded-md text-gray-100 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-200"
                                step="0.00000001"
                                placeholder="例: 0.1"
                                aria-label="保有BTC"
                            />
                        </InputField>
                        <InputField label="取り崩し開始年" error={errors.startYear}>
                            <select
                                value={startYear}
                                onChange={(e) => setStartYear(e.target.value)}
                                className="w-full bg-gray-700 p-2 rounded-md text-gray-100 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-200"
                                aria-label="取り崩し開始年"
                            >
                                {Array.from({ length: 26 }, (_, i) => CURRENT_YEAR + i).map((year) => (
                                    <option key={year} value={year}>{year}年</option>
                                ))}
                            </select>
                        </InputField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="価格予測モデル" tooltip={TOOLTIPS.priceModel}>
                            <select
                                value={priceModel}
                                onChange={(e) => setPriceModel(e.target.value as 'standard' | 'conservative')}
                                className="w-full bg-gray-700 p-2 rounded-md text-gray-100 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-200"
                            >
                                <option value={PriceModel.STANDARD}>標準モデル</option>
                                <option value={PriceModel.CONSERVATIVE}>保守的モデル</option>
                            </select>
                        </InputField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="取り崩し方法" error={errors.withdrawalType}>
                            <select
                                value={withdrawalType}
                                onChange={(e) => setWithdrawalType(e.target.value as 'fixed' | 'percentage')}
                                className="w-full bg-gray-700 p-2 rounded-md text-gray-100 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-200"
                            >
                                <option value="fixed">定額（月額）</option>
                                <option value="percentage">定率（年率）</option>
                            </select>
                        </InputField>
                        <InputField
                            label={withdrawalType === "fixed" ? "取り崩し額（月額、税引き後）" : "取り崩し率（年率）"}
                            tooltip={withdrawalType === "fixed" ? TOOLTIPS.withdrawalAmount : TOOLTIPS.withdrawalRate}
                            error={withdrawalType === "fixed" ? errors.withdrawalAmount : errors.withdrawalRate}
                        >
                            <div className="relative">
                                <input
                                    type="number"
                                    value={withdrawalType === "fixed" ? withdrawalAmount : withdrawalRate}
                                    onChange={(e) => withdrawalType === "fixed" ? setWithdrawalAmount(e.target.value) : setWithdrawalRate(e.target.value)}
                                    className="w-full bg-gray-700 p-2 rounded-md text-gray-100 pr-12 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-200"
                                    placeholder={withdrawalType === "fixed" ? "例: 200000" : "例: 4"}
                                    step={withdrawalType === "fixed" ? "1000" : "0.1"}
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    {withdrawalType === "fixed" ? "円" : "%"}
                                </span>
                            </div>
                        </InputField>
                    </div>

                    <div className="mt-4">
                        <label className="flex items-center space-x-2 text-gray-300 mb-2">
                            <input
                                type="checkbox"
                                checked={showSecondPhase}
                                onChange={(e) => setShowSecondPhase(e.target.checked)}
                                className="rounded bg-gray-600 focus:ring-2 focus:ring-amber-500 transition-all duration-200"
                            />
                            <span className={`${typography.body} ${colors.textSecondary}`}>2段階目の設定を有効にする</span>
                            <TooltipIcon content={TOOLTIPS.secondPhase} />
                        </label>
                        {showSecondPhase && (
                            <div className="pl-4 space-y-4 border-l-2 border-gray-700">
                                <InputField label="2段階目開始年" error={errors.secondPhaseYear}>
                                    <select
                                        value={secondPhaseYear}
                                        onChange={(e) => setSecondPhaseYear(e.target.value)}
                                        className="w-full bg-gray-700 p-2 rounded-md text-gray-100 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-200"
                                    >
                                        {Array.from({ length: 26 }, (_, i) => CURRENT_YEAR + i).map((year) => (
                                            <option key={year} value={year}>{year}年</option>
                                        ))}
                                    </select>
                                </InputField>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="2段階目取り崩し方法" error={errors.secondPhaseType}>
                                        <select
                                            value={secondPhaseType}
                                            onChange={(e) => setSecondPhaseType(e.target.value as 'fixed' | 'percentage')}
                                            className="w-full bg-gray-700 p-2 rounded-md text-gray-100 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-200"
                                        >
                                            <option value="fixed">定額（月額）</option>
                                            <option value="percentage">定率（年率）</option>
                                        </select>
                                    </InputField>
                                    <InputField
                                        label={secondPhaseType === "fixed" ? "取り崩し額（月額、税引き後）" : "取り崩し率（年率）"}
                                        error={secondPhaseType === "fixed" ? errors.secondPhaseAmount : errors.secondPhaseRate}
                                    >
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={secondPhaseType === "fixed" ? secondPhaseAmount : secondPhaseRate}
                                                onChange={(e) => secondPhaseType === "fixed" ? setSecondPhaseAmount(e.target.value) : setSecondPhaseRate(e.target.value)}
                                                className="w-full bg-gray-700 p-2 rounded-md text-gray-100 pr-12 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-200"
                                                placeholder={secondPhaseType === "fixed" ? "例: 200000" : "例: 4"}
                                                step={secondPhaseType === "fixed" ? "1000" : "0.1"}
                                            />
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                {secondPhaseType === "fixed" ? "円" : "%"}
                                            </span>
                                        </div>
                                    </InputField>
                                </div>
                            </div>
                        )}
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
                            {showAdvancedOptions ? <ChevronUp size={18} className={colors.textPrimary} /> : <ChevronDown size={18} className={colors.textSecondary} />}
                        </div>
                        {showAdvancedOptions && (
                            <div className="mt-4 space-y-4 p-4 bg-gray-700 rounded-md">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <InputField label="税率 (%)" tooltip={TOOLTIPS.taxRate} error={errors.taxRate}>
                                        <input
                                            type="number"
                                            value={taxRate}
                                            onChange={(e) => setTaxRate(e.target.value)}
                                            className="w-full bg-gray-600 p-2 rounded-md text-gray-100 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-200"
                                            step="0.1"
                                            placeholder="例: 20.315"
                                        />
                                    </InputField>
                                    <InputField label="為替レート (円/USD)" tooltip={TOOLTIPS.exchangeRate} error={errors.exchangeRate}>
                                        <input
                                            type="number"
                                            value={exchangeRate}
                                            onChange={(e) => setExchangeRate(e.target.value)}
                                            className="w-full bg-gray-600 p-2 rounded-md text-gray-100 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-200"
                                            step="0.1"
                                            placeholder="例: 150"
                                        />
                                    </InputField>
                                    <InputField label="インフレ率 (%)" tooltip={TOOLTIPS.inflationRate} error={errors.inflationRate}>
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
                            disabled={isCalculating}
                            className={`${colors.accent} w-full p-3 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-50 shadow-md flex justify-center items-center ${isCalculating ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isCalculating ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    計算中...
                                </>
                            ) : (
                                'シミュレーション実行'
                            )}
                        </button>
                    </div>
                </div>

                {errors.simulation && (
                    <div className="mt-4 p-3 bg-red-900 text-gray-100 rounded-md">
                        {errors.simulation}
                    </div>
                )}

                {results.length > 0 && (
                    <div className="mt-8 space-y-6">
                        <div className={`${colors.cardBg} p-6 rounded-xl shadow-md ${colors.cardBorder}`}>
                            <h2 className={`${typography.h2} ${colors.textPrimary} mb-4`}>資産推移</h2>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4A4A5A" />
                                    <XAxis dataKey="year" stroke="#e2e8f0" tick={{ fontSize: 12, fill: '#e2e8f0' }} />
                                    <YAxis
                                        yAxisId="left"
                                        orientation="left"
                                        tickFormatter={(value) => formatBTC(value, 4)}
                                        tick={{ fill: '#e2e8f0' }}
                                        domain={['auto', 'auto']}
                                        label={{
                                            value: 'BTC残高',
                                            angle: -90,
                                            position: 'insideLeft',
                                            style: { fill: '#34D399', fontSize: 12, fontWeight: 500 }
                                        }}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        tickFormatter={(value) => formatYen(value, 2)}
                                        tick={{ fill: '#e2e8f0' }}
                                        domain={['auto', 'auto']}
                                        label={{
                                            value: '資産評価額',
                                            angle: 90,
                                            position: 'insideRight',
                                            style: { fill: '#60A5FA', fontSize: 12, fontWeight: 500 }
                                        }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(26, 32, 44, 0.95)', border: '1px solid rgba(82, 82, 91, 0.8)', borderRadius: '8px' }}
                                        labelStyle={{ color: '#e2e8f0' }}
                                        formatter={(value, name) => {
                                            if (typeof name === 'string') {
                                                if (name === 'btcHeld') {
                                                    return [formatBTC(value as number, 4), '残り保有BTC'];
                                                } else if (name === 'totalValue') {
                                                    return [formatYen(value as number, 2), '資産評価額'];
                                                }
                                            }
                                            return [value, name];
                                        }}
                                    />
                                    <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="btcHeld"
                                        stroke="#34D399"
                                        name="残り保有BTC"
                                        dot={false}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="totalValue"
                                        stroke="#60A5FA"
                                        name="資産評価額"
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* モバイル向けカード表示 */}
                        <div className={`block md:hidden ${colors.cardBg} p-4 rounded-xl shadow-md space-y-3`}>
                            <h3 className={`${typography.h3} ${colors.textPrimary} mb-2`}>ハイライト</h3>
                            <div className="bg-gray-700 p-3 rounded-md">
                                <div className={`${typography.small} ${colors.textMuted}`}>BTC初期保有量</div>
                                <div className={`${typography.body} ${colors.textPrimary}`}>{formatBTC(parseFloat(initialBTC) || 0, 4)}</div>
                            </div>
                            <div className="bg-gray-700 p-3 rounded-md">
                                <div className={`${typography.small} ${colors.textMuted}`}>取り崩し開始年</div>
                                <div className={`${typography.body} ${colors.textPrimary}`}>{startYear}年</div>
                            </div>
                            <div className="bg-gray-700 p-3 rounded-md">
                                <div className={`${typography.small} ${colors.textMuted}`}>
                                    {withdrawalType === "fixed" ? "月額取り崩し" : "年間取り崩し率"}
                                </div>
                                <div className={`${typography.body} ${colors.textPrimary}`}>
                                    {withdrawalType === "fixed"
                                        ? formatYen(parseFloat(withdrawalAmount) || 0, 2)
                                        : formatPercentage(parseFloat(withdrawalRate) || 0, 2)}
                                </div>
                            </div>
                            {(() => {
                                const zeroIndex = results.findIndex(r => r.remainingBTC <= 0);
                                const zeroYear = zeroIndex !== -1 ? results[zeroIndex].year : null;
                                return (
                                    <div className="bg-gray-700 p-3 rounded-md">
                                        <div className={`${typography.small} ${colors.textMuted}`}>資金寿命</div>
                                        <div className={`${typography.body} ${colors.textPrimary}`}>
                                            {zeroYear
                                                ? `${zeroYear}年（${zeroYear - parseInt(startYear)}年間）`
                                                : "2050年以降も維持"}
                                        </div>
                                    </div>
                                );
                            })()}
                            <div className="bg-gray-700 p-3 rounded-md">
                                <div className={`${typography.small} ${colors.textMuted}`}>5年後の資産評価額</div>
                                <div className={`${typography.body} ${colors.textPrimary}`}>
                                    {formatYen(
                                        results.find(r => r.year === CURRENT_YEAR + 5)?.totalValue || 0,
                                        2
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* デスクトップ向け表形式表示 */}
                        <div className={`hidden md:block ${colors.cardBg} p-6 rounded-xl shadow-md ${colors.cardBorder}`}>
                            <div className="flex justify-between mb-4">
                                <h3 className={`${typography.h3} ${colors.textPrimary}`}>シミュレーション結果</h3>
                            </div>
                            <div className="overflow-x-auto -mx-6 px-6">
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead className="bg-gray-700">
                                        <tr>
                                            <th scope="col" className={`${typography.small} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>年</th>
                                            <th scope="col" className={`${typography.small} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>BTC価格</th>
                                            {showSecondPhase && (
                                                <th scope="col" className={`${typography.small} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>段階</th>
                                            )}
                                            <th scope="col" className={`${typography.small} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>取り崩し率</th>
                                            <th scope="col" className={`${typography.small} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>取り崩し額</th>
                                            <th scope="col" className={`${typography.small} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>取り崩しBTC</th>
                                            <th scope="col" className={`${typography.small} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>残り保有BTC</th>
                                            <th scope="col" className={`${typography.small} px-4 py-3 text-left ${colors.textPrimary} uppercase tracking-wider`}>資産評価額</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {results.map((result) => (
                                            <tr key={result.year} className={result.year % 2 === 0 ? "bg-gray-800" : "bg-gray-750 hover:bg-gray-700 transition-colors duration-200"}>
                                                <td className={`${typography.body} px-4 py-2 whitespace-nowrap ${colors.textPrimary}`}>{result.year}</td>
                                                <td className={`${typography.body} px-4 py-2 whitespace-nowrap ${colors.textPrimary}`}>{formatYen(result.btcPrice, 2)}</td>
                                                {showSecondPhase && (
                                                    <td className={`${typography.body} px-4 py-2 whitespace-nowrap ${colors.textPrimary}`}>{result.phase}</td>
                                                )}
                                                <td className={`${typography.body} px-4 py-2 whitespace-nowrap ${colors.textPrimary}`}>
                                                    {typeof result.withdrawalRate === 'number' ? formatPercentage(result.withdrawalRate, 2) : result.withdrawalRate}
                                                </td>
                                                <td className={`${typography.body} px-4 py-2 whitespace-nowrap ${colors.textPrimary}`}>
                                                    {typeof result.withdrawalAmount === 'number' ? formatYen(result.withdrawalAmount, 2) : result.withdrawalAmount}
                                                </td>
                                                <td className={`${typography.body} px-4 py-2 whitespace-nowrap ${colors.textPrimary}`}>
                                                    {typeof result.withdrawalBTC === 'number' ? formatBTC(result.withdrawalBTC, 4) : result.withdrawalBTC}
                                                </td>
                                                <td className={`${typography.body} px-4 py-2 whitespace-nowrap ${colors.textPrimary}`}>{formatBTC(result.remainingBTC, 4)}</td>
                                                <td className={`${typography.body} px-4 py-2 whitespace-nowrap ${colors.textPrimary}`}>{formatYen(result.totalValue, 2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WithdrawalSimulator;