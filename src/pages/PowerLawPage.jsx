import React from 'react';

const PowerLawPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          パワーロー解説
        </h1>

        <section className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            スケール不変性からみるパワーロー
          </h2>
          <div className="text-gray-300 space-y-4">
            <p>
              パワーロー（べき乗則）は、自然界や社会システムに普遍的に観察される現象です。
              その本質的な特徴は「スケール不変性」にあります。つまり、観察するスケール（規模）が
              変わっても、同じパターンが繰り返し現れるという性質です。
            </p>
            <div className="bg-gray-700 p-4 rounded-lg mt-4">
              <h3 className="text-lg font-medium text-white mb-2">代表的な例</h3>
              <ul className="space-y-3">
                <li>
                  <span className="font-medium text-blue-400">都市の発展則</span>
                  <p className="mt-1">都市の人口が10倍になると、インフラや経済活動は体系的に約15-17倍に増加します。この比率は、
                    小規模都市でも大都市でも一貫して観察されます。</p>
                </li>
                <li>
                  <span className="font-medium text-blue-400">ネットワーク効果</span>
                  <p className="mt-1">通信ネットワークの価値は、利用者数の二乗に比例して増加します（メトカーフの法則）。
                    この関係性は、小規模なネットワークでも大規模なものでも維持されます。</p>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            ビットコインのパワーロー特性
          </h2>
          <div className="text-gray-300 space-y-4">
            <p>
              ビットコインの価格形成メカニズムは、単なる需要と供給のバランスを超えた
              複雑な相互作用システムとして理解できます：
            </p>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-3">3つの相互作用メカニズム</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">🔄</span>
                  <div>
                    <p className="font-medium">フィードバックループ</p>
                    <p className="text-sm">価格上昇 → 採掘参入増加 → セキュリティ向上 → 信頼性増加 → 新規参入者増加
                      というポジティブフィードバックが、自己強化的な成長を生み出します。</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">⚖️</span>
                  <div>
                    <p className="font-medium">難易度調整メカニズム</p>
                    <p className="text-sm">採掘の急激な増加を抑制し、成長を安定化させる自動制御システムとして機能します。
                      これにより、指数関数的な暴走を防ぎ、パワーロー的な成長が維持されます。</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">📊</span>
                  <div>
                    <p className="font-medium">アドプション動態</p>
                    <p className="text-sm">新規参入者の増加は、既存ユーザー数の二乗に比例します（メトカーフの法則）。
                      これが価格形成の基礎となる評価関数を提供します。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            実務的な示唆
          </h2>
          <div className="text-gray-300 space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-2">パワーローの実践的解釈</h3>
              <ul className="space-y-2">
                <li>
                  <span className="font-medium">中央値モデル</span>：最も蓋然性の高い価格推移パス
                </li>
                <li>
                  <span className="font-medium">下限値モデル</span>：歴史的な価格下限の軌跡
                </li>
                <li>
                  <span className="font-medium">上方バブル</span>：新しい採用層の参入に伴う一時的な過熱現象
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-12 pt-8 border-t border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            本解説について
          </h2>
          <div className="text-gray-300">
            <p className="mb-4">
              本解説は、以下の先駆的研究の知見を参考にしています：
            </p>
            <div className="bg-gray-800 p-4 rounded-lg space-y-3">
              <div>
                <a
                  href="https://hcburger.com/blog/powerlaw/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Harold Christopher Burger (2019) "Bitcoin's natural long-term power-law corridor of growth"
                </a>
                <p className="text-sm mt-1">
                  ビットコインの価格推移におけるパワーロー特性の基礎的研究
                </p>
              </div>
              <div>
                <a
                  href="https://giovannisantostasi.medium.com/the-bitcoin-power-law-theory-962dfaf99ee9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Giovanni Santostasi (2024) "The Bitcoin Power Law Theory"
                </a>
                <p className="text-sm mt-1">
                  パワーロー理論の包括的な発展と実証的研究
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PowerLawPage;