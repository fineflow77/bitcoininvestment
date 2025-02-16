import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChevronDown, ChevronUp, Settings } from "lucide-react";

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

// フォーマット用ヘルパー関数
const formatCurrency = (value) => {
    if (!value) return "0";
    if (value >= 1e8) return `${(value / 1e8).toFixed(2)}億`;
    if (value >= 1e4) return `${(value / 1e4).toFixed(1)}万`;
    return `${value.toFixed(0)}`;
};

const formatPercent = (value) => `${value}%`;
const formatBTC = (value) => parseFloat(value).toFixed(8);

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

    const [priceModel, setPriceModel] = useState("standard");

    // 詳細設定
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [exchangeRate, setExchangeRate] = useState("150");
    const [inflationRate, setInflationRate] = useState("2.0");
    const TAX_RATE = 20.315;

    const [results, setResults] = useState([]);
    const [error, setError] = useState("");

    // シミュレーション実行関数
    const simulate = () => {
        try {
            // 入力値のバリデーション
            if (!initialBTC || isNaN(parseFloat(initialBTC)) || parseFloat(initialBTC) <= 0) {
                setError("初期BTC保有量を正しく入力してください");
                return;
            }
            if (withdrawalType === "fixed") {
                if (!withdrawalAmount || isNaN(parseFloat(withdrawalAmount)) || parseFloat(withdrawalAmount) <= 0) {
                    setError("取り崩し額を正しく入力してください");
                    return;
                }
            } else {
                if (!withdrawalRate || isNaN(parseFloat(withdrawalRate)) || parseFloat(withdrawalRate) <= 0 || parseFloat(withdrawalRate) > 100) {
                    setError("取り崩し率を正しく入力してください");
                    return;
                }
            }

            // 2段階目のバリデーション
            if (showSecondPhase) {
                if (secondPhaseType === "fixed" && (!secondPhaseAmount || isNaN(parseFloat(secondPhaseAmount)) || parseFloat(secondPhaseAmount) <= 0)) {
                    setError("2段階目の取り崩し額を正しく入力してください");
                    return;
                }
                if (secondPhaseType === "percentage" && (!secondPhaseRate || isNaN(parseFloat(secondPhaseRate)) || parseFloat(secondPhaseRate) <= 0 || parseFloat(secondPhaseRate) > 100)) {
                    setError("2段階目の取り崩し率を正しく入力してください");
                    return;
                }
            }

            const selectedModel = priceModel === "standard" ? STANDARD_PRICE_MODEL : CONSERVATIVE_PRICE_MODEL;
            let currentBTC = parseFloat(initialBTC);
            const simulationResults = [];
            const exchangeRateNum = parseFloat(exchangeRate);
            const startYearNum = parseInt(startYear);
            const inflationRateNum = parseFloat(inflationRate) / 100;
            const taxRateNum = TAX_RATE / 100;

            for (let year = startYearNum; year <= 2050 && currentBTC > 0; year++) {
                const btcPriceUSD = selectedModel[year];
                const btcPriceJPY = btcPriceUSD * exchangeRateNum;
                const inflationFactor = Math.pow(1 + inflationRateNum, year - startYearNum);

                let withdrawalBTC = 0;
                let currentWithdrawalType = withdrawalType;
                let currentWithdrawalAmount = withdrawalAmount;
                let currentWithdrawalRate = withdrawalRate;

                if (showSecondPhase && year >= parseInt(secondPhaseYear)) {
                    currentWithdrawalType = secondPhaseType;
                    currentWithdrawalAmount = secondPhaseAmount;
                    currentWithdrawalRate = secondPhaseRate;
                }

                if (currentWithdrawalType === "fixed") {
                    const monthlyAmountWithInflation = parseFloat(currentWithdrawalAmount) * inflationFactor;
                    withdrawalBTC = (monthlyAmountWithInflation * 12) / btcPriceJPY;
                } else {
                    withdrawalBTC = currentBTC * (parseFloat(currentWithdrawalRate) / 100);
                }

                // 税引後の調整
                withdrawalBTC = withdrawalBTC * (1 + taxRateNum);

                const yearEndBTC = currentBTC - withdrawalBTC;
                const totalValue = currentBTC * btcPriceJPY;
                const withdrawalValue = withdrawalBTC * btcPriceJPY;

                simulationResults.push({
                    year,
                    btcPrice: btcPriceJPY,
                    withdrawalRate: currentWithdrawalType === "fixed" ?
                        ((withdrawalBTC / currentBTC) * 100).toFixed(2) : currentWithdrawalRate,
                    withdrawalAmount: withdrawalValue,
                    remainingBTC: yearEndBTC,
                    totalValue
                });

                currentBTC = yearEndBTC;
                if (currentBTC < 0) break;
            }

            setResults(simulationResults);
            setError("");
        } catch (err) {
            setError("シミュレーション中にエラーが発生しました: " + err.message);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg text-white">
            <h1 className="text-2xl font-bold text-center mb-6">BTC取り崩しシミュレーター</h1>

            {/* 基本設定フォーム */}
            <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                        初期BTC保有量
                        <input
                            type="number"
                            value={initialBTC}
                            onChange={(e) => setInitialBTC(e.target.value)}
                            className="w-full bg-gray-700 p-2 rounded-md mt-1 placeholder-gray-500"
                            step="0.00000001"
                            placeholder="例: 0.1"
                        />
                    </label>

                    <label className="block">
                        取り崩し開始年
                        <select
                            value={startYear}
                            onChange={(e) => setStartYear(e.target.value)}
                            className="w-full bg-gray-700 p-2 rounded-md mt-1"
                        >
                            {Array.from({ length: 26 }, (_, i) => 2025 + i).map(year => (
                                <option key={year} value={year}>{year}年</option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                        取り崩し方法
                        <select
                            value={withdrawalType}
                            onChange={(e) => setWithdrawalType(e.target.value)}
                            className="w-full bg-gray-700 p-2 rounded-md mt-1"
                        >
                            <option value="fixed">定額（月額）</option>
                            <option value="percentage">定率（年率）</option>
                        </select>
                    </label>

                    <label className="block">
                        {withdrawalType === "fixed" ? "取り崩し額（月額、税引き後）" : "取り崩し率（年率）"}
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
                                className="w-full bg-gray-700 p-2 rounded-md mt-1 placeholder-gray-500 pr-12"
                                placeholder={withdrawalType === "fixed" ? "例: 200000" : "例: 4"}
                                step={withdrawalType === "fixed" ? "1000" : "0.1"}
                            />
                            <span className="absolute right-3 top-1/2 mt-1 text-gray-400">
                                {withdrawalType === "fixed" ? "円" : "%"}
                            </span>
                        </div>
                    </label>
                </div>

                <div>
                    <label className="flex items-center space-x-2 text-sm mb-4">
                        <input
                            type="checkbox"
                            checked={showSecondPhase}
                            onChange={(e) => setShowSecondPhase(e.target.checked)}
                            className="rounded bg-gray-600"
                        />
                        <span>2段階目の設定を有効にする</span>
                    </label>

                    {showSecondPhase && (
                        <div className="pl-6 space-y-4">
                            <label className="block">
                                2段階目開始年
                                <select
                                    value={secondPhaseYear}
                                    onChange={(e) => setSecondPhaseYear(e.target.value)}
                                    className="w-full bg-gray-700 p-2 rounded-md mt-1"
                                >
                                    {Array.from({ length: 26 }, (_, i) => 2025 + i).map(year => (
                                        <option key={year} value={year}>{year}年</option>
                                    ))}
                                </select>
                            </label>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="block">
                                    2段階目取り崩し方法
                                    <select
                                        value={secondPhaseType}
                                        onChange={(e) => setSecondPhaseType(e.target.value)}
                                        className="w-full bg-gray-700 p-2 rounded-md mt-1"
                                    >
                                        <option value="fixed">定額（月額）</option>
                                        <option value="percentage">定率（年率）</option>
                                    </select>
                                </label>

                                <label className="block">
                                    {secondPhaseType === "fixed" ? "取り崩し額（月額、税引び後）" : "取り崩し率（年率）"}
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
                                            className="w-full bg-gray-700 p-2 rounded-md mt-1 placeholder-gray-500 pr-12"
                                            placeholder={secondPhaseType === "fixed" ? "例: 200000" : "例: 4"}
                                            step={secondPhaseType === "fixed" ? "1000" : "0.1"}
                                        />
                                        <span className="absolute right-3 top-1/2 mt-1 text-gray-400">
                                            {secondPhaseType === "fixed" ? "円" : "%"}
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                <label className="block">
                    パワーローモデル
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

            {/* 詳細設定トグル */}
            <div
                className="flex items-center justify-between p-3 bg-gray-700 rounded-md cursor-pointer mb-4"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
                <div className="flex items-center space-x-2">
                    <Settings size={18} />
                    <span className="text-sm font-medium">詳細設定</span>
                </div>
                {showAdvancedOptions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            {/* 詳細設定パネル */}
            {showAdvancedOptions && (
                <div className="space-y-4 mb-6 p-4 bg-gray-700 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                            為替レート（円/USD）
                            <input
                                type="number"
                                value={exchangeRate}
                                onChange={(e) => setExchangeRate(e.target.value)}
                                className="w-full bg-gray-600 p-2 rounded-md mt-1"
                                placeholder="150"
                            />
                        </label>
                        <div className="block">
                            <span className="block text-sm mb-2">想定税率（%）</span>
                            <div className="w-full bg-gray-600 p-2 rounded-md text-gray-300">
                                {TAX_RATE}%
                            </div>
                        </div>
                    </div>

                    <label className="block">
                        インフレ率（%）
                        <input
                            type="number"
                            value={inflationRate}
                            onChange={(e) => setInflationRate(e.target.value)}
                            className="w-full bg-gray-600 p-2 rounded-md mt-1"
                            step="0.1"
                            placeholder="2.0"
                        />
                    </label>
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-md text-red-100">
                    {error}
                </div>
            )}

            <button
                onClick={simulate}
                className="w-full bg-blue-500 p-3 rounded-md hover:bg-blue-600 transition-colors"
            >
                シミュレーション実行
            </button>

            {/* 結果表示 */}
            {results.length > 0 && (
                <div className="mt-6 space-y-6">
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <h2 className="text-lg font-semibold mb-4">資産推移</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={results} margin={{ top: 5, right: 50, left: 50, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="year" stroke="#9CA3AF" />
                                <YAxis
                                    yAxisId="left"
                                    stroke="#10B981"
                                    label={{ value: '残存BTC', angle: -90, position: 'left', fill: '#10B981' }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    stroke="#3B82F6"
                                    label={{ value: '資産評価額(円)', angle: 90, position: 'right', fill: '#3B82F6' }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                                    labelStyle={{ color: '#9CA3AF' }}
                                    formatter={(value, name) => {
                                        if (name === "残存BTC") return [formatBTC(value), name];
                                        return [formatCurrency(value) + "円", name];
                                    }}
                                />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="remainingBTC"
                                    name="残存BTC"
                                    stroke="#10B981"
                                    dot={false}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="totalValue"
                                    name="資産評価額"
                                    stroke="#3B82F6"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-gray-700 p-4 rounded-lg overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-gray-600">
                                    <th className="px-3 py-2 whitespace-nowrap">年</th>
                                    <th className="px-3 py-2 whitespace-nowrap">1BTC価格</th>
                                    <th className="px-3 py-2 whitespace-nowrap">取り崩し率</th>
                                    <th className="px-3 py-2 whitespace-nowrap">年間取り崩し額</th>
                                    <th className="px-3 py-2 whitespace-nowrap">残存BTC</th>
                                    <th className="px-3 py-2 whitespace-nowrap">資産評価額</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((result, index) => (
                                    <tr key={index} className={index % 2 === 0 ? "bg-gray-800" : ""}>
                                        <td className="px-3 py-2 whitespace-nowrap">{result.year}</td>
                                        <td className="px-3 py-2 whitespace-nowrap">{formatCurrency(result.btcPrice)}円</td>
                                        <td className="px-3 py-2 whitespace-nowrap">{formatPercent(result.withdrawalRate)}</td>
                                        <td className="px-3 py-2 whitespace-nowrap">{formatCurrency(result.withdrawalAmount)}円</td>
                                        <td className="px-3 py-2 whitespace-nowrap">{formatBTC(result.remainingBTC)}</td>
                                        <td className="px-3 py-2 whitespace-nowrap">{formatCurrency(result.totalValue)}円</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BTCWithdrawalSimulator;