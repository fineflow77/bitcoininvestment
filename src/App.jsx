import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import InvestmentSimulator from "./InvestmentSimulator";
import BTCWithdrawalSimulator from "./BTCWithdrawalSimulator"; // 既存の取崩しシミュレーター

function App() {
  return (
    <Router>
      <div className="bg-gray-900 min-h-screen text-white p-6">
        <nav className="mb-6">
          <ul className="flex gap-4">
            <li><Link to="/" className="text-blue-400 hover:underline">取崩しシミュレーター</Link></li>
            <li><Link to="/investment-simulator" className="text-blue-400 hover:underline">積み立てシミュレーター</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<BTCWithdrawalSimulator />} />
          <Route path="/investment-simulator" element={<InvestmentSimulator />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
