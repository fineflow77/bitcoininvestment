import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// BTCの価格データ（JPY換算済み）
const BTC_PRICE_JPY = {
    2025: 17872350, 2026: 24725700, 2027: 33450000, 2028: 45290000, 2029: 61234500,
    2030: 82875000, 2031: 112089000, 2032: 151404000, 2033: 204750000, 2034: 276900000,
    2035: 374700000, 2036: 506700000, 2037: 685000000, 2038: 927000000, 2039: 1255000000,
    2040: 1705000000, 2041: 2310000000, 2042: 3135000000, 2043: 4250000000, 2044: 5765000000,
    2045: 7800000000, 2046: 10560000000, 2047: 14300000000, 2048: 19350000000, 2049: 26200000000,
    2050: 35450000000
};

const BTCWithdrawalSimulator = () => {
    const [initialBTC, setInitialBTC] = useState("1");
    const [isPhaseTwo, setIsPhaseTwo] = useState(false);
    const [phaseOne, setPhaseOne] = useState({ startYear: "2025", amount: "500000" });
    const [phaseTwo, setPhaseTwo] = useState({ startYear: "2030", amount: "300000" });
    const [results, setResults] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState({ taxRate: 20.315 });

    // シミュレーション実行
    const simulate = () => {
        const btcAmount = parseFloat(initialBTC);
        const phase1Start = parseInt(phaseOne.startYear);
        const phase2Start = parseInt(phaseTwo.startYear);

        if (!btcAmount || btcAmount <= 0) {
            alert("初期BTC保有量を入力してください");
            return;
        }

        const simResults = [];
        let currentBTC = btcAmount;

        for (let year = 2025; year <= 2050; year++) {
            const btcPrice = BTC_PRICE_JPY[year];
            const totalValue = currentBTC * btcPrice;

            let monthlyAmount = 0;
            if (year >= phase1Start) {
                monthlyAmount = year >= phase2Start && isPhaseTwo ? parseFloat(phaseTwo.amount) : parseFloat(phaseOne.amount);
            }

            const yearlyWithdrawal = (monthlyAmount * 12) / (1 - settings.taxRate / 100);
            const withdrawalBTC = yearlyWithdrawal / btcPrice;
            const remainingBTC = currentBTC - withdrawalBTC;

            simResults.push({
                year,
                btcPrice,
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
        <div className="bg-gray-900 min-h-screen p-8 font-sans text-white">
            <h1 className="text-2xl font-semibold mb-6">BTC取崩シミュレーター</h1>

            <div className="grid gap-6 max-w-3xl">
                <div>
                    <label className="block mb-2">初期BTC保有量</label>
                    <input type="text" value={initialBTC} onChange={(e) => setInitialBTC(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                </div>
                <button onClick={simulate} className="mt-4 px-6 py-2 bg-blue-500 rounded-md">シミュレーション実行</button>
            </div>

            {results.length > 0 && (
                <div className="mt-8">
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={results}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                            <XAxis dataKey="year" stroke="#e5e7eb" />
                            <YAxis stroke="#e5e7eb" />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="totalValue" name="資産評価額" stroke="#facc15" strokeWidth={2} />
                            <Line type="monotone" dataKey="remainingBTC" name="残存BTC" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>

                    <table className="mt-6 w-full border border-gray-700 text-left">
                        <thead>
                            <tr className="bg-gray-800">
                                <th className="p-2">年</th>
                                <th className="p-2">1BTC予想価格 (円)</th>
                                <th className="p-2">資産評価額 (円)</th>
                                <th className="p-2">年間取崩額 (円)</th>
                                <th className="p-2">残存BTC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((row) => (
                                <tr key={row.year} className="border-b border-gray-700">
                                    <td className="p-2">{row.year}</td>
                                    <td className="p-2">{row.btcPrice.toLocaleString()}円</td>
                                    <td className="p-2">{row.totalValue.toLocaleString()}円</td>
                                    <td className="p-2">{row.withdrawalAmount.toLocaleString()}円</td>
                                    <td className="p-2">{row.remainingBTC.toFixed(6)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BTCWithdrawalSimulator;