import React, { useState } from "react";
import BTCWithdrawalSimulator from "./BTCWithdrawalSimulator";
import InvestmentSimulator from "./InvestmentSimulator";

const App = () => {
  const [activeSimulator, setActiveSimulator] = useState("withdrawal");

  return (
    <div className="bg-gray-900 min-h-screen p-8 font-sans">
      {/* ナビゲーションバー */}
      <nav className="flex justify-center mb-6">
        <button
          className={`px-4 py-2 mx-2 rounded-md ${activeSimulator === "withdrawal" ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"
            }`}
          onClick={() => setActiveSimulator("withdrawal")}
        >
          取り崩しシミュレーター
        </button>
        <button
          className={`px-4 py-2 mx-2 rounded-md ${activeSimulator === "investment" ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"
            }`}
          onClick={() => setActiveSimulator("investment")}
        >
          積み立てシミュレーター
        </button>
      </nav>

      {/* シミュレーターの切り替え */}
      <div className="container mx-auto">
        {activeSimulator === "withdrawal" ? <BTCWithdrawalSimulator /> : <InvestmentSimulator />}
      </div>
    </div>
  );
};

export default App;