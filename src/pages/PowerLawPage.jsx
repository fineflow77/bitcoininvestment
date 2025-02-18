import React from 'react';

const PowerLawPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          ビットコインのパワーロー（べき乗の法則）
        </h1>

        <section className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            パワーローとは
          </h2>
          <p className="text-gray-300 mb-4">
            パワーロー（べき乗の法則）は、ビットコインの価格予測モデルの一つです。
            このモデルは、ビットコインのStock to Flow比率（既存の供給量に対する新規供給量の比率）と
            市場価値との間に存在する相関関係を示しています。
          </p>
        </section>

        <section className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            長期投資における意義
          </h2>
          <div className="text-gray-300 space-y-4">
            <p>
              パワーローモデルが重要視される理由：
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>長期的な価格トレンドの予測に有効</li>
              <li>ビットコインの希少性と価値の関係を数学的に説明</li>
              <li>過去10年以上のデータで実証されている</li>
            </ul>
          </div>
        </section>

        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            シミュレーターでの活用方法
          </h2>
          <p className="text-gray-300 mb-4">
            当サイトのシミュレーターでは、パワーローモデルに基づく2つの価格予測シナリオを提供しています：
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-xl font-medium text-white mb-2">標準モデル</h3>
              <p className="text-gray-300">
                パワーローの中央値に基づく予測。長期的な価格トレンドの基準として使用。
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-xl font-medium text-white mb-2">保守的モデル</h3>
              <p className="text-gray-300">
                パワーローの-1標準偏差に基づく予測。より慎重な計画を立てる際に使用。
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PowerLawPage;