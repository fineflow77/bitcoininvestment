



import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChevronDown, ChevronUp, Settings, HelpCircle, Info } from "lucide-react";
import { STANDARD_PRICE_MODEL, CONSERVATIVE_PRICE_MODEL } from "../../constants/priceModels";
import { formatCurrency, formatPercent, formatBTC } from "../../utils/formatters";

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
                <label className="text-gray-300">{label}</label>
                {tooltip && <TooltipIcon content={tooltip} />}
            </div>
            {children}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

// デフォルト値の定義
const DEFAULTS = {
    TAX_RATE: 20.315,
    EXCHANGE_RATE: 150,
    INFLATION_RATE: 0,
};

const CURRENT_YEAR = new Date().getFullYear();

// ツールチップコンテンツ
const TOOLTIPS = {
    initialBTC: "現在保有しているビットコインの量を入力してください。",
    withdrawalAmount: "毎月の生活費として必要な金額を入力してください。税引き後の手取り額として計算されます。",
    withdrawalRate: "資産からの年間取り崩し率を指定します。一般的なFIREでは4%が目安とされています。",
    secondPhase: "特定の年から取り崩し方法や金額を変更できます。退職後の生活スタイルの変化などに対応します。",
    taxRate: "利益に対する税率を設定します。デフォルトは確定申告を行った場合の税率です。",
    exchangeRate: "円ドルの為替レートを設定します。",
    inflationRate: "年間の物価上昇率を設定します。"
};

// 広告コンポーネント
const AdPlacement = ({ position }) => {
    return (
        <div className={`ad-container ${position} bg-gray-700 p-4 rounded-lg mb-4`}>
            <div className="text-xs text-gray-400 mb-2">広告</div>
            <div className="bg-gray-600 h-[100px] flex items-center justify-center">
                <span className="text-gray-400">Advertisement</span>
            </div>
        </div>
    );
};



const BTCWithdrawalSimulator = () => {
    // 基本設定
    const [initialBTC, setInitialBTC] = useState("");
    const [startYear, setStartYear] = useState("2025");
    const [withdrawalType, setWithdrawalType] = useState("fixed");
    const [withdrawalAmount, setWithdrawalAmount] = useState("");
    const [withdrawalRate, setWithdrawalRate] = useState("4");

    // 2段階目の設定
    const [showSecondPhase, setShowSecondPhase] = useState(false);
    const [secondPhaseYear, setSecondPhaseYear] = useState("2030");
    const [secondPhaseType, setSecondPhaseType] = useState("fixed");
    const [secondPhaseAmount, setSecondPhaseAmount] = useState("");
    const [secondPhaseRate, setSecondPhaseRate] = useState("4");

    // 詳細設定
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [taxRate, setTaxRate] = useState(DEFAULTS.TAX_RATE.toString());
    const [exchangeRate, setExchangeRate] = useState(DEFAULTS.EXCHANGE_RATE.toString());
    const [inflationRate, setInflationRate] = useState(DEFAULTS.INFLATION_RATE.toString());
    const [priceModel, setPriceModel] = useState("standard");

    // 結果と状態
    const [results, setResults] = useState([]);
    const [errors, setErrors] = useState({});

    // バリデーション関数
    const validateInputs = () => {
        const newErrors = {};

        // 基本設定のバリデーション
        if (!initialBTC || isNaN(parseFloat(initialBTC)) || parseFloat(initialBTC) <= 0) {
            newErrors.initialBTC = "ビットコイン保有数量量を正しく入力してください";
        }

        if (withdrawalType === "fixed") {
            if (!withdrawalAmount || isNaN(parseFloat(withdrawalAmount)) || parseFloat(withdrawalAmount) <= 0) {
                newErrors.withdrawalAmount = "月々の取り崩し額（税引後）を正しく入力してください";
            }
        } else {
            if (!withdrawalRate || isNaN(parseFloat(withdrawalRate)) || parseFloat(withdrawalRate) <= 0 || parseFloat(withdrawalRate) > 100) {
                newErrors.withdrawalRate = "取り崩し率は0%から100%の間で入力してください";
            }
        }

        // 2段階目の設定のバリデーション
        if (showSecondPhase) {
            if (secondPhaseType === "fixed" && (!secondPhaseAmount || isNaN(parseFloat(secondPhaseAmount)) || parseFloat(secondPhaseAmount) <= 0)) {
                newErrors.secondPhaseAmount = "2段階目の取り崩し額を正しく入力してください";
            }
            if (secondPhaseType === "percentage" && (!secondPhaseRate || isNaN(parseFloat(secondPhaseRate)) || parseFloat(secondPhaseRate) <= 0 || parseFloat(secondPhaseRate) > 100)) {
                newErrors.secondPhaseRate = "2段階目の取り崩し率は0%から100%の間で入力してください";
            }
            if (parseInt(secondPhaseYear) <= parseInt(startYear)) {
                newErrors.secondPhaseYear = "2段階目の開始年は取り崩し開始年より後に設定してください";
            }
        }

        // 詳細設定のバリデーション
        if (parseFloat(taxRate) < 0 || parseFloat(taxRate) > 100) {
            newErrors.taxRate = "税率は0%から100%の間で入力してください";
        }
        if (parseFloat(exchangeRate) <= 0) {
            newErrors.exchangeRate = "為替レートは0より大きい値を入力してください";
        }
        if (parseFloat(inflationRate) < 0) {
            newErrors.inflationRate = "インフレ率は0%以上で入力してください";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 入力値のリセット
    const resetInputs = () => {
        setInitialBTC("");
        setWithdrawalAmount("");
        setWithdrawalRate("4");
        setSecondPhaseAmount("");
        setSecondPhaseRate("4");
        setErrors({});
        setResults([]);
    };

    // 次のコードブロックで、simulateとレンダリング部分を実装します
    // ...続く





    // シミュレーション実行関数の続き
    const simulate = () => {
        if (!validateInputs()) {
            return;
        }

        try {
            const selectedModel = priceModel === "standard" ? STANDARD_PRICE_MODEL : CONSERVATIVE_PRICE_MODEL;
            let currentBTC = parseFloat(initialBTC);
            const simulationResults = [];
            const exchangeRateNum = parseFloat(exchangeRate);
            const taxRateNum = parseFloat(taxRate) / 100;
            const inflationRateNum = parseFloat(inflationRate) / 100;
            const startYearNum = parseInt(startYear);

            // 現在年から開始
            for (let year = CURRENT_YEAR; year <= 2050 && currentBTC > 0; year++) {
                const isBeforeStart = year < startYearNum;
                const btcPriceUSD = selectedModel[year] || selectedModel[startYearNum];
                const btcPriceJPY = btcPriceUSD * exchangeRateNum;

                let withdrawalBTC = 0;
                let withdrawalValue = 0;
                let effectiveWithdrawalRate = 0;

                if (!isBeforeStart) {
                    // 2段階目の設定を考慮
                    let currentWithdrawalType = withdrawalType;
                    let currentWithdrawalAmount = withdrawalAmount;
                    let currentWithdrawalRate = withdrawalRate;

                    if (showSecondPhase && year >= parseInt(secondPhaseYear)) {
                        currentWithdrawalType = secondPhaseType;
                        currentWithdrawalAmount = secondPhaseAmount;
                        currentWithdrawalRate = secondPhaseRate;
                    }

                    if (currentWithdrawalType === "fixed") {
                        // 税引後の年間取り崩し額（月額の12倍）
                        const annualWithdrawalAmount = parseFloat(currentWithdrawalAmount) * 12;
                        // BTCに変換
                        withdrawalBTC = annualWithdrawalAmount / btcPriceJPY;
                        withdrawalValue = annualWithdrawalAmount;
                        effectiveWithdrawalRate = (withdrawalBTC / currentBTC) * 100;
                    } else {
                        effectiveWithdrawalRate = parseFloat(currentWithdrawalRate);
                        withdrawalBTC = currentBTC * (effectiveWithdrawalRate / 100);
                        withdrawalValue = withdrawalBTC * btcPriceJPY;
                    }
                }

                const yearEndBTC = currentBTC - withdrawalBTC;
                const totalValue = currentBTC * btcPriceJPY;

                simulationResults.push({
                    year,
                    btcPrice: btcPriceJPY,
                    withdrawalRate: isBeforeStart ? "-" : effectiveWithdrawalRate,
                    withdrawalAmount: isBeforeStart ? "-" : withdrawalValue,
                    remainingBTC: yearEndBTC,
                    totalValue,
                    phase: isBeforeStart ? "-" :
                        (showSecondPhase && year >= parseInt(secondPhaseYear)) ? "第2フェーズ" : "第1フェーズ"
                });

                currentBTC = yearEndBTC;
                if (currentBTC < 0) break;
            }

            setResults(simulationResults);
            setErrors({});
        } catch (err) {
            setErrors({ simulation: "シミュレーション中にエラーが発生しました: " + err.message });
        }
    };

    // レンダリング
    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* 広告スペース（上部） */}
            <AdPlacement position="top" />

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-white text-center mb-6">
                    ビットコイン取り崩しシミュレーター
                </h1>

                {/* 基本設定フォーム */}
                <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="保有BTC"
                            tooltip={TOOLTIPS.initialBTC}
                            error={errors.initialBTC}
                        >
                            <input
                                type="number"
                                value={initialBTC}
                                onChange={(e) => setInitialBTC(e.target.value)}
                                className="w-full bg-gray-700 p-2 rounded-md text-white"
                                step="0.00000001"
                                placeholder="例: 0.1"
                            />
                        </InputField>


                        < InputField
                            label="取り崩し開始年"
                            error={errors.startYear}
                        >
                            <select
                                value={startYear}
                                onChange={(e) => setStartYear(e.target.value)}
                                className="w-full bg-gray-700 p-2 rounded-md text-white"
                            >
                                {Array.from({ length: 26 }, (_, i) => CURRENT_YEAR + i).map(year => (
                                    <option key={year} value={year}>{year}年</option>
                                ))}
                            </select>
                        </InputField >
                    </div >

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="取り崩し方法"
                            error={errors.withdrawalType}
                        >
                            <select
                                value={withdrawalType}
                                onChange={(e) => setWithdrawalType(e.target.value)}
                                className="w-full bg-gray-700 p-2 rounded-md text-white"
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
                                    onChange={(e) => {
                                        if (withdrawalType === "fixed") {
                                            setWithdrawalAmount(e.target.value);
                                        } else {
                                            setWithdrawalRate(e.target.value);
                                        }
                                    }}
                                    className="w-full bg-gray-700 p-2 rounded-md text-white pr-12"
                                    placeholder={withdrawalType === "fixed" ? "例: 200000" : "例: 4"}
                                    step={withdrawalType === "fixed" ? "1000" : "0.1"}
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    {withdrawalType === "fixed" ? "円" : "%"}
                                </span>
                            </div>
                        </InputField>
                    </div>

                    {/* 2段階目の設定 */}
                    <div className="mt-6">
                        <label className="flex items-center space-x-2 text-white mb-4">
                            <input
                                type="checkbox"
                                checked={showSecondPhase}
                                onChange={(e) => setShowSecondPhase(e.target.checked)}
                                className="rounded bg-gray-600"
                            />
                            <span>2段階目の設定を有効にする</span>
                            <TooltipIcon content={TOOLTIPS.secondPhase} />
                        </label>

                        {showSecondPhase && (
                            <div className="pl-6 space-y-4 border-l-2 border-gray-700">
                                <InputField
                                    label="2段階目開始年"
                                    error={errors.secondPhaseYear}
                                >
                                    <select
                                        value={secondPhaseYear}
                                        onChange={(e) => setSecondPhaseYear(e.target.value)}
                                        className="w-full bg-gray-700 p-2 rounded-md text-white"
                                    >
                                        {Array.from({ length: 26 }, (_, i) => CURRENT_YEAR + i).map(year => (
                                            <option key={year} value={year}>{year}年</option>
                                        ))}
                                    </select>
                                </InputField>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField
                                        label="2段階目取り崩し方法"
                                        error={errors.secondPhaseType}
                                    >
                                        <select
                                            value={secondPhaseType}
                                            onChange={(e) => setSecondPhaseType(e.target.value)}
                                            className="w-full bg-gray-700 p-2 rounded-md text-white"
                                        >
                                            <option value="fixed">定額（月額）</option>
                                            <option value="percentage">定率（年率）</option>
                                        </select>
                                    </InputField>

                                    <InputField
                                        label={secondPhaseType === "fixed" ? "取り崩し額（月額、税引後）" : "取り崩し率（年率）"}
                                        error={secondPhaseType === "fixed" ? errors.secondPhaseAmount : errors.secondPhaseRate}
                                    >
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={secondPhaseType === "fixed" ? secondPhaseAmount : secondPhaseRate}
                                                onChange={(e) => {
                                                    if (secondPhaseType === "fixed") {
                                                        setSecondPhaseAmount(e.target.value);
                                                    } else {
                                                        setSecondPhaseRate(e.target.value);
                                                    }
                                                }}
                                                className="w-full bg-gray-700 p-2 rounded-md text-white pr-12"
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

                    {/* 続く（詳細設定と結果表示部分） */}



                    {/* 詳細設定 */}
                    <div className="mt-6">
                        <div
                            className="flex items-center justify-between p-3 bg-gray-700 rounded-md cursor-pointer"
                            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                        >
                            <div className="flex items-center space-x-2">
                                <Settings size={18} className="text-gray-300" />
                                <span className="text-white">詳細設定</span>
                            </div>
                            {showAdvancedOptions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>

                        {showAdvancedOptions && (
                            <div className="mt-4 space-y-4 p-4 bg-gray-700 rounded-md">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <InputField
                                        label="税率 (%)"
                                        tooltip={TOOLTIPS.taxRate}
                                        error={errors.taxRate}
                                    >
                                        <input
                                            type="number"
                                            value={taxRate}
                                            onChange={(e) => setTaxRate(e.target.value)}
                                            className="w-full bg-gray-600 p-2 rounded-md text-white"
                                            step="0.1"
                                        />
                                    </InputField>

                                    <InputField
                                        label="為替レート (円/USD)"
                                        tooltip={TOOLTIPS.exchangeRate}
                                        error={errors.exchangeRate}
                                    >
                                        <input
                                            type="number"
                                            value={exchangeRate}
                                            onChange={(e) => setExchangeRate(e.target.value)}
                                            className="w-full bg-gray-600 p-2 rounded-md text-white"
                                            step="0.1"
                                        />
                                    </InputField>

                                    <InputField
                                        label="インフレ率 (%)"
                                        tooltip={TOOLTIPS.inflationRate}
                                        error={errors.inflationRate}
                                    >
                                        <input
                                            type="number"
                                            value={inflationRate}
                                            onChange={(e) => setInflationRate(e.target.value)}
                                            className="w-full bg-gray-600 p-2 rounded-md text-white"
                                            step="0.1"
                                        />
                                    </InputField>
                                </div>

                                <InputField label="価格予測モデル">
                                    <select
                                        value={priceModel}
                                        onChange={(e) => setPriceModel(e.target.value)}
                                        className="w-full bg-gray-600 p-2 rounded-md text-white"
                                    >
                                        <option value="standard">標準モデル</option>
                                        <option value="conservative">保守的モデル</option>
                                    </select>
                                </InputField>
                            </div>
                        )}
                    </div>

                    {/* シミュレーションボタン */}
                    <div className="mt-6">
                        <button
                            onClick={simulate}
                            className="w-full bg-blue-500 p-3 rounded-md text-white hover:bg-blue-600 transition-colors"
                        >
                            シミュレーション実行
                        </button>
                    </div>
                </div >

                {/* サイド広告 */}
                < div className="hidden lg:block fixed right-4 top-20 w-64" >
                    <AdPlacement position="side" />
                </div >

                {/* 結果表示 */}
                {
                    results.length > 0 && (
                        <div className="mt-8 space-y-6">
                            {/* グラフ表示 */}
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h2 className="text-lg font-semibold text-white mb-4">資産推移</h2>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={results} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis
                                            dataKey="year"
                                            stroke="#9CA3AF"
                                            label={{ value: '年', position: 'insideBottom', offset: -5 }}
                                        />
                                        <YAxis
                                            yAxisId="left"
                                            stroke="#34D399"
                                            label={{ value: '残存BTC', angle: -90, position: 'insideLeft' }}
                                        />
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            stroke="#60A5FA"
                                            label={{
                                                value: '資産評価額',
                                                angle: 90,
                                                position: 'insideRight',
                                                offset: 10,
                                                style: { fill: '#60A5FA', fontSize: '14px' }
                                            }}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                                            labelStyle={{ color: '#9CA3AF' }}
                                            formatter={(value, name) => {
                                                if (name === "残存BTC") return [formatBTC(value), name];
                                                return [formatCurrency(value), name];
                                            }}
                                        />
                                        <Legend />
                                        <Line
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="remainingBTC"
                                            name="残存BTC"
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

                            {/* 結果テーブル */}
                            <div className="bg-gray-700 p-4 rounded-lg overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left border-b border-gray-600">
                                            <th className="p-2 whitespace-nowrap text-gray-300">年</th>
                                            <th className="p-2 whitespace-nowrap text-gray-300">フェーズ</th>
                                            <th className="p-2 whitespace-nowrap text-gray-300">1BTC価格</th>
                                            <th className="p-2 whitespace-nowrap text-gray-300">取り崩し率</th>
                                            <th className="p-2 whitespace-nowrap text-gray-300">年間取り崩し額</th>
                                            <th className="p-2 whitespace-nowrap text-gray-300">残存BTC</th>
                                            <th className="p-2 whitespace-nowrap text-gray-300">資産評価額</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((result, index) => (
                                            <tr
                                                key={index}
                                                className={`
                                               ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}
                                               ${result.phase === "-" ? 'text-gray-500' : 'text-gray-100'}
                                           `}
                                            >

                                                <td className="p-2 whitespace-nowrap">{result.year}</td>
                                                <td className="p-2 whitespace-nowrap">{result.phase}</td>
                                                <td className="p-2 whitespace-nowrap">{formatCurrency(result.btcPrice)}</td>
                                                <td className="p-2 whitespace-nowrap">{result.withdrawalRate === "-" ? "-" : formatPercent(result.withdrawalRate)}</td>
                                                <td className="p-2 whitespace-nowrap">{result.withdrawalAmount === "-" ? "-" : formatCurrency(result.withdrawalAmount)}</td>
                                                <td className="p-2 whitespace-nowrap">{formatBTC(result.remainingBTC)}</td>
                                                <td className="p-2 whitespace-nowrap">{formatCurrency(result.totalValue)}</td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* 下部広告 */}
                            <AdPlacement position="bottom" />
                        </div>
                    )
                }
            </div >
        </div >
    );
};

export default BTCWithdrawalSimulator;
