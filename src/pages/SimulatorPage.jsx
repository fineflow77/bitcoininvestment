import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BTCWithdrawalSimulator from '../components/simulators/BTCWithdrawalSimulator';
import InvestmentSimulator from '../components/simulators/InvestmentSimulator';

const SimulatorPage = () => {
  const [searchParams] = useSearchParams();
  const [simulatorType, setSimulatorType] = useState(searchParams.get('type') || 'withdrawal');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center mb-6">
        <button
          className={`px-4 py-2 mx-2 rounded-md ${simulatorType === 'withdrawal' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
          onClick={() => setSimulatorType('withdrawal')}
        >
          取り崩しシミュレーター
        </button>
        <button
          className={`px-4 py-2 mx-2 rounded-md ${simulatorType === 'investment' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
          onClick={() => setSimulatorType('investment')}
        >
          積み立てシミュレーター
        </button>
      </div>

      {simulatorType === 'withdrawal' ? (
        <BTCWithdrawalSimulator />
      ) : (
        <InvestmentSimulator />
      )}
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

export default SimulatorPage;