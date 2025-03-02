import React, { useState, useMemo, useEffect } from "react"; // useMemo をインポート
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChevronDown, ChevronUp, Settings, HelpCircle } from "lucide-react";
import { formatNumber, formatCurrency, formatBTC } from '../../utils/formatters';


// ツールチップアイコンコンポーネント (共通コンポーネントとして別ファイルに切り出すことも検討)
const TooltipIcon = ({ content }) => (
    <div className="group relative inline-block ml-2">
        <HelpCircle className="h-4 w-4 text-gray-300 hover:text-white cursor-help" />
        <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg">
            {content}
        </div>
    </div>
);

// インプットフィールドコンポーネント (共通コンポーネントとして別ファイルに切り出すことも検討)
const InputField = ({ label, tooltip, error, children }) => (
    <div className="mb-4">
        <div className="flex items-center mb-1">
            <label className="text-white font-medium text-sm">{label}</label>
            {tooltip && <TooltipIcon content={tooltip} />}
        </div>
        {children}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

// 定数 (constants.js など別ファイルに切り出すことも検討)
const DEFAULTS = {
    TAX_RATE: 20.315,
    EXCHANGE_RATE: 150,
    INFLATION_RATE: 0,
};

const START_YEAR = 2009;
const TRANSITION_START_YEAR = 2039; // 緩和開始年
const TARGET_YEAR = 2050; // 目標年
const CURRENT_YEAR = new Date().getFullYear();

const TOOLTIPS = {
    initialBTC: "現在保有しているビットコインの量を入力してください。",
    withdrawalAmount: "毎月の生活費として必要な金額を入力してください。税引き後の手取り額として計算されます。",
    withdrawalRate: "資産からの年間取り崩し率を指定します。一般的なFIREでは4%が目安とされています。",
    secondPhase: "特定の年から取り崩し方法や金額を変更できます。退職後の生活スタイルの変化などに対応します。",
    taxRate: "利益に対する税率を設定します。デフォルトは確定申告を行った場合の税率です。",
    exchangeRate: "円ドルの為替レートを設定します。",
    inflationRate: "年間の物価上昇率を設定します。",
    priceModel: <React.Fragment>
        <p>標準モデル：HC Burgerが提唱するパワーロー方程式を基に、2039年以降滑らかに減衰し2050年で1000万ドルに到達すると仮定。ビットコインが従来の法定通貨に代わる世界的な基軸通貨になるシナリオ（ビットコインスタンダード）。</p>
        <p className="mt-2">保守的モデル：HC Burgerが提唱するパワーロー方程式を控えめに調整し、2039年以降滑らかに減衰し2050年で400万ドルに到達すると仮定。ビットコインがゴールド（金）の4倍程度の時価総額になり、価値の保存手段の定番になるシナリオ。</p>
    </React.Fragment>,
};

// 価格予測モデル関数 (models.js など別ファイルに切り出すことも検討)
const btcPriceMedian = (days, model = "standard") => {
    if (days <= 0) return 1;
    const k = model === "standard" ? 5.84509376 : 5.75;
    return Math.pow(10, -17.01593313 + k * Math.log10(days));
};

// 日数計算関数
const calculateDays = (year) => Math.max(Math.floor((new Date(year, 11, 31) - new Date("2009-01-03")) / (1000 * 60 * 60 * 24)), 1);


const BTCWithdrawalSimulator = () => {
    const [initialBTC, setInitialBTC] = useState("");
    const [startYear, setStartYear] = useState("2025");
    const [priceModel, setPriceModel] = useState("standard");
    const [withdrawalType, setWithdrawalType] = useState("fixed");
    const [withdrawalAmount, setWithdrawalAmount] = useState("");
    const [withdrawalRate, setWithdrawalRate] = useState("4");
    const [showSecondPhase, setShowSecondPhase] = useState(false);
    const [secondPhaseYear, setSecondPhaseYear] = useState("2030");
    const [secondPhaseType, setSecondPhaseType] = useState("fixed");
    const [secondPhaseAmount, setSecondPhaseAmount] = useState("");
    const [secondPhaseRate, setSecondPhaseRate] = useState("4");
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [taxRate, setTaxRate] = useState(DEFAULTS.TAX_RATE.toString());
    const [exchangeRate, setExchangeRate] = useState(DEFAULTS.EXCHANGE_RATE.toString());
    const [inflationRate, setInflationRate] = useState(DEFAULTS.INFLATION_RATE.toString());
    const [results, setResults] = useState([]);
    const [errors, setErrors] = useState({});

    // 入力値検証
    const validateInputs = () => {
        const newErrors = {};

        if (!initialBTC || isNaN(parseFloat(initialBTC)) || parseFloat(initialBTC) < 0) {
            newErrors.initialBTC = "有効な値を入力してください";
        }

        if (withdrawalType === "fixed") {
            if (!withdrawalAmount || isNaN(parseFloat(withdrawalAmount)) || parseFloat(withdrawalAmount) <= 0) {
                newErrors.withdrawalAmount = "有効な値を入力してください";
            }
        } else {
            if (!withdrawalRate || isNaN(parseFloat(withdrawalRate)) || parseFloat(withdrawalRate) <= 0 || parseFloat(withdrawalRate) > 100) {
                newErrors.withdrawalRate = "0～100%で入力してください";
            }
        }

        if (showSecondPhase) {
            if (secondPhaseType === "fixed" && (!secondPhaseAmount || isNaN(parseFloat(secondPhaseAmount)) || parseFloat(secondPhaseAmount) <= 0)) {
                newErrors.secondPhaseAmount = "有効な値を入力してください";
            }
            if (secondPhaseType === "percentage" && (!secondPhaseRate || isNaN(parseFloat(secondPhaseRate)) || parseFloat(secondPhaseRate) <= 0 || parseFloat(secondPhaseRate) > 100)) {
                newErrors.secondPhaseRate = "0～100%で入力してください";
            }
            if (parseInt(secondPhaseYear) <= parseInt(startYear)) {
                newErrors.secondPhaseYear = "開始年より後にしてください";
            }
        }

        if (parseFloat(taxRate) < 0 || parseFloat(taxRate) > 100) {
            newErrors.taxRate = "0～100%で入力してください";
        }
        if (parseFloat(exchangeRate) <= 0) {
            newErrors.exchangeRate = "0より大きくしてください";
        }
        if (parseFloat(inflationRate) < 0) {
            newErrors.inflationRate = "0%以上で入力してください";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // シミュレーション実行
    const simulate = () => {
        if (!validateInputs()) return;

        try {
            let currentBTC = parseFloat(initialBTC);
            const simulationResults = [];
            const exchangeRateNum = parseFloat(exchangeRate);
            const taxRateNum = parseFloat(taxRate) / 100;
            const inflationRateNum = parseFloat(inflationRate) / 100;
            const startYearNum = parseInt(startYear);
            let basePriceUSD = null;
            let baseDays = null;

            for (let year = CURRENT_YEAR; year <= TARGET_YEAR; year++) {
                const isBeforeStart = year < startYearNum; // 取り崩し開始前かどうか
                const days = calculateDays(year);

                // BTC価格計算 (パワーローモデル)
                let btcPriceUSD = btcPriceMedian(days, priceModel);
                if (year >= TRANSITION_START_YEAR) {
                    // 2039年以降は減衰
                    if (!basePriceUSD) {
                        basePriceUSD = btcPriceMedian(calculateDays(TRANSITION_START_YEAR - 1), priceModel); // 2038年末時点の価格
                        baseDays = calculateDays(TRANSITION_START_YEAR - 1);
                    }
                    // 減衰率 (standard: 0.2, conservative: 0.25)
                    const decayRate = priceModel === "standard" ? 0.2 : 0.25;
                    // 2050年時点のスケール (standard: 0.41, conservative: 0.5)
                    const targetScale = priceModel === "standard" ? 0.41 : 0.5;
                    const scale = targetScale + (1.0 - targetScale) * Math.exp(-decayRate * (year - (TRANSITION_START_YEAR - 1)));
                    btcPriceUSD = basePriceUSD * Math.pow(btcPriceMedian(days, priceModel) / btcPriceMedian(baseDays, priceModel), scale);
                }

                // 価格が異常値の場合はエラー
                if (!btcPriceUSD || btcPriceUSD <= 0) {
                    throw new Error(`Invalid BTC price calculated for year ${year}: ${btcPriceUSD}`);
                }

                // 実効為替レート
                const effectiveExchangeRate = exchangeRateNum * Math.pow(1 + inflationRateNum, year - startYearNum);
                const btcPriceJPY = btcPriceUSD * effectiveExchangeRate;

                let withdrawalBTC = 0; // 年間のBTC取り崩し量
                let withdrawalValue = 0; // 年間の取り崩し額 (日本円)
                let effectiveWithdrawalRate = 0; // 実効取り崩し率

                if (!isBeforeStart) {
                    // 取り崩し計算
                    let currentWithdrawalType = withdrawalType;
                    let currentWithdrawalAmount = withdrawalAmount;
                    let currentWithdrawalRate = withdrawalRate;

                    // 2段階目が有効な場合
                    if (showSecondPhase && year >= parseInt(secondPhaseYear)) {
                        currentWithdrawalType = secondPhaseType;
                        currentWithdrawalAmount = secondPhaseAmount;
                        currentWithdrawalRate = secondPhaseRate;
                    }

                    if (currentWithdrawalType === "fixed") {
                        // 定額取り崩し
                        const annualWithdrawalAmount = parseFloat(currentWithdrawalAmount) * 12; // 月額を年額に
                        withdrawalBTC = annualWithdrawalAmount / btcPriceJPY; // BTC換算
                        withdrawalValue = annualWithdrawalAmount;
                        // 取り崩し額が保有量を超える場合はエラー
                        if (withdrawalBTC > currentBTC) {
                            throw new Error(`Withdrawal amount exceeds available BTC in year ${year}.`);
                        }
                        effectiveWithdrawalRate = (withdrawalBTC / currentBTC) * 100;
                    } else { // 定率
                        effectiveWithdrawalRate = parseFloat(currentWithdrawalRate);
                        withdrawalBTC = currentBTC * (effectiveWithdrawalRate / 100);
                        withdrawalValue = withdrawalBTC * btcPriceJPY; // JPY換算
                        if (withdrawalBTC > currentBTC) {
                            withdrawalBTC = currentBTC;
                            withdrawalValue = withdrawalBTC * btcPriceJPY;
                        }
                    }
                }

                const yearEndBTC = currentBTC - withdrawalBTC; // 年末時点のBTC
                const totalValue = currentBTC * btcPriceJPY;    // 年末時点の評価額

                simulationResults.push({
                    year,
                    btcPrice: btcPriceJPY,
                    withdrawalRate: isBeforeStart ? "-" : effectiveWithdrawalRate,
                    withdrawalAmount: isBeforeStart ? "-" : withdrawalValue,
                    withdrawalBTC: isBeforeStart ? "-" : withdrawalBTC,
                    remainingBTC: yearEndBTC,
                    totalValue,
                    phase: isBeforeStart ? "-" : (showSecondPhase && year >= parseInt(secondPhaseYear)) ? "2段階目" : (showSecondPhase ? "1段階目" : "-"),
                });

                currentBTC = yearEndBTC; // 現在のBTC保有量を更新
                if (currentBTC < 0) break; // 一応、負の値になったら終了
            }

            setResults(simulationResults);
            setErrors({}); // エラーがない場合はクリア
        } catch (err) {
            setErrors({ simulation: "シミュレーション中にエラーが発生しました: " + err.message });
        }
    };

    const chartData = useMemo(() => {
        return results.map(result => ({
            year: result.year,
            btcHeld: result.remainingBTC, // remainingBTC を使用
            totalValue: result.totalValue,
        }));
    }, [results]);

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-white text-center mb-6">ビットコイン取り崩しシミュレーター</h1>

                <div className="space-y-6">
                    {/* ... (入力フォーム部分は省略) ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="保有BTC" tooltip={TOOLTIPS.initialBTC} error={errors.initialBTC}>
                            <input
                                type="number"
                                value={initialBTC}
                                onChange={(e) => setInitialBTC(e.target.value)}
                                className="w-full bg-gray-700 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                step="0.00000001"
                                placeholder="例: 0.1"
                            />
                        </InputField>
                        <InputField label="取り崩し開始年" error={errors.startYear}>
                            <select
                                value={startYear}
                                onChange={(e) => setStartYear(e.target.value)}
                                className="w-full bg-gray-700 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                {Array.from({ length: 26 }, (_, i) => CURRENT_YEAR + i).map((year) => (
                                    <option key={year} value={year}>{year}年</option>
                                ))}
                            </select>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="取り崩し方法" error={errors.withdrawalType}>
                            <select
                                value={withdrawalType}
                                onChange={(e) => setWithdrawalType(e.target.value)}
                                className="w-full bg-gray-700 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                    className="w-full bg-gray-700 p-2 rounded-md text-white pr-12 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder={withdrawalType === "fixed" ? "例: 200000" : "例: 4"}
                                    step={withdrawalType === "fixed" ? "1000" : "0.1"}
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300">
                                    {withdrawalType === "fixed" ? "円" : "%"}
                                </span>
                            </div>
                        </InputField>
                    </div>

                    <div className="mt-4">
                        <label className="flex items-center space-x-2 text-white mb-2">
                            <input
                                type="checkbox"
                                checked={showSecondPhase}
                                onChange={(e) => setShowSecondPhase(e.target.checked)}
                                className="rounded bg-gray-600 focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-white">2段階目の設定を有効にする</span>
                            <TooltipIcon content={TOOLTIPS.secondPhase} />
                        </label>
                        {showSecondPhase && (
                            <div className="pl-4 space-y-4 border-l-2 border-gray-700">
                                <InputField label="2段階目開始年" error={errors.secondPhaseYear}>
                                    <select
                                        value={secondPhaseYear}
                                        onChange={(e) => setSecondPhaseYear(e.target.value)}
                                        className="w-full bg-gray-700 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        {Array.from({ length: 26 }, (_, i) => CURRENT_YEAR + i).map((year) => (
                                            <option key={year} value={year}>{year}年</option>
                                        ))}
                                    </select>
                                </InputField>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField label="2段階目取り崩し方法" error={errors.secondPhaseType}>
                                        <select
                                            value={secondPhaseType}
                                            onChange={(e) => setSecondPhaseType(e.target.value)}
                                            className="w-full bg-gray-700 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                                className="w-full bg-gray-700 p-2 rounded-md text-white pr-12 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                placeholder={secondPhaseType === "fixed" ? "例: 200000" : "例: 4"}
                                                step={secondPhaseType === "fixed" ? "1000" : "0.1"}
                                            />
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300">
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
                                <Settings size={18} className="text-white" />
                                <span className="text-white font-medium text-sm">詳細設定</span>
                            </div>
                            {showAdvancedOptions ? <ChevronUp size={18} className="text-white" /> : <ChevronDown size={18} className="text-white" />}
                        </div>
                        {showAdvancedOptions && (
                            <div className="mt-4 space-y-4 p-4 bg-gray-700 rounded-md">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <InputField label="税率 (%)" tooltip={TOOLTIPS.taxRate} error={errors.taxRate}>
                                        <input
                                            type="number"
                                            value={taxRate}
                                            onChange={(e) => setTaxRate(e.target.value)}
                                            className="w-full bg-gray-600 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            step="0.1"
                                            placeholder="例: 20.315"
                                        />
                                    </InputField>
                                    <InputField label="為替レート (円/USD)" tooltip={TOOLTIPS.exchangeRate} error={errors.exchangeRate}>
                                        <input
                                            type="number"
                                            value={exchangeRate}
                                            onChange={(e) => setExchangeRate(e.target.value)}
                                            className="w-full bg-gray-600 p-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            step="0.1"
                                            placeholder="例: 150"
                                        />
                                    </InputField>
                                    <InputField label="インフレ率 (%)" tooltip={TOOLTIPS.inflationRate} error={errors.inflationRate}>
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
                                {/* ... (LineChart のコードは後述) ... */}
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-gray-700 p-4 rounded-lg overflow-x-auto">
                            <div className="flex justify-between mb-2">
                                <h3 className="text-md font-semibold text-white">シミュレーション結果</h3>
                                {showSecondPhase && (
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-blue-500 mr-2"></div>
                                            <span className="text-xs text-white">1段階目</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-purple-500 mr-2"></div>
                                            <span className="text-xs text-white">2段階目</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* ... (テーブルのコード) ... */}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BTCWithdrawalSimulator;