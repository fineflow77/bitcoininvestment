import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from 'react-router-dom';
import BTCWithdrawalSimulator from '../components/simulators/BTCWithdrawalSimulator';
import InvestmentSimulator from '../components/simulators/InvestmentSimulator';

const SimulatorPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [simulatorType, setSimulatorType] = useState(searchParams.get('type') || 'withdrawal');

  // シミュレータータイプが変更されたらURLも更新
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('type', simulatorType);
    setSearchParams(params);
  }, [simulatorType, setSearchParams]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* 小さな文字の見出しに変更 */}
        <h1 className="text-sm font-bold text-center mb-8 text-gray-400">ビットコイン投資シミュレーター</h1>

        {/* シミュレーターの解説セクションを削除 */}

        {/* シミュレータータイプ切り替えボタン */}
        <div className="flex justify-center mb-6">
          <button
            className={`px-4 py-2 mx-2 rounded-md text-lg ${simulatorType === 'withdrawal' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setSimulatorType('withdrawal')}
          >
            取り崩しシミュレーター
          </button>
          <button
            className={`px-4 py-2 mx-2 rounded-md text-lg ${simulatorType === 'investment' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setSimulatorType('investment')}
          >
            積み立てシミュレーター
          </button>
        </div>

        {/* 適切なシミュレーターコンポーネントを表示 */}
        <div className="bg-gray-700 p-4 rounded-lg">
          {simulatorType === 'withdrawal' ? (
            <BTCWithdrawalSimulator />
          ) : (
            <InvestmentSimulator />
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
    </div>
  );
};

export default SimulatorPage;