import React from 'react';
import { Link } from 'react-router-dom';

const PowerLawPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">


      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            パワーロー（べき乗則）解説
          </h1>

          <section id="what-is-power-law" className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">
              パワーローとは？：ビットコイン長期予測の基礎
            </h2>
            <div className="text-gray-300 space-y-4">
              <p>
                パワーロー、別名「べき乗則」は、自然界や社会現象に広く見られる法則です。シンプルな数式で表され、ログスケールで見ると直線になるという特徴があります。これは、ビットコインの長期的価格推移を予測する上で非常に重要な性質です。
              </p>
              <p>
                パワーローが現れる現象として、地震の発生頻度、都市の人口分布、言語の単語の使用頻度、富の分配などが挙げられます。これらの現象に共通するのは、スケールが変わっても同じパターンが繰り返される「自己相似性」という特徴です。
              </p>
              <p>
                ビットコインの価格もこのパワーローに従うと考えられています。その理由としては、ネットワーク効果（メトカーフの法則）、供給の半減期、採掘難易度の調整などの要素が複雑に絡み合い、長期的には一定の成長パターンを示すためです。
              </p>
            </div>
          </section>

          <section id="santostasi" className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">
              ビットコインのパワーローモデル：Giovanni Santostasi の研究
            </h2>
            <div className="text-gray-300 space-y-4">
              <p>
                物理学者の Giovanni Santostasi は、ビットコインの価格がパワーローに従う理論的根拠を詳細に研究しました。彼のモデルによれば、ビットコイン価格は時間の累乗関数として表され、対数スケールでプロットすると直線になります。
              </p>
              <p>
                Santostasi の研究では、ビットコインの価格形成には以下の3つの主要な要素が影響していると指摘しています：
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li><span className="font-medium text-blue-300">自己強化的なフィードバックループ</span>：価格上昇が新たな買い手を引き寄せ、さらなる価格上昇につながる循環</li>
                <li><span className="font-medium text-blue-300">難易度調整メカニズム</span>：マイニング難易度の自動調整により、長期的な供給の安定性が保たれる</li>
                <li><span className="font-medium text-blue-300">ネットワーク効果</span>：参加者が増えるほど、ネットワークの価値が指数関数的に増大する</li>
              </ul>
              <p>
                Santostasi のモデルは、ビットコインの価格が時間の関数として表せ、対数スケールでプロットすると直線になることを示しています。
              </p>
            </div>
          </section>

          <section id="burger" className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">
              パワーローモデルの実践的な活用：HC Burger の知見
            </h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Harold Christopher Burger は、パワーローモデルを実際のビットコイン投資に応用するための実践的なフレームワークを提示しました。彼の研究は、ビットコインの価格変動を長期的なトレンドとして捉え、投資判断に活用できる形にモデル化しています。
              </p>
              <p>
                Burgerのモデルでは、ビットコインの価格推移を3つの重要なラインで表現しています：
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li><span className="font-medium text-green-400">中央価格（Median Price）</span>：長期的に価格が最も滞在しやすい中心的な価格帯</li>
                <li><span className="font-medium text-red-400">下限価格（Support）</span>：歴史的に価格が下回ったことがない、または極めて稀にしか下回らない価格レベル</li>
                <li><span className="font-medium text-blue-400">上限価格（Resistance）</span>：強気相場の最終段階で価格が到達しうる上限レベル</li>
              </ul>
              <p>
                これらのラインは、いずれもパワーロー関数で表されます。
              </p>
            </div>
          </section>

          <section id="limitations" className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">
              パワーローモデルの限界と留意点
            </h2>
            <div className="text-gray-300 space-y-4">
              <p>
                パワーローモデルは強力なツールですが、いくつかの限界と留意点があります：
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li><span className="font-medium text-yellow-300">長期モデルである</span>：短期的な価格変動や市場心理を反映していないため、数週間〜数ヶ月の動きを予測するには適していません</li>
                <li><span className="font-medium text-yellow-300">過去のデータに基づく</span>：将来の規制変更、技術革新、大規模な経済危機などの予測不可能な要因を考慮していません</li>
                <li><span className="font-medium text-yellow-300">指数関数的成長の持続性</span>：どんな資産も永続的に指数関数的な成長を続けることはできないため、非常に長期的には成長率が鈍化する可能性があります</li>
                <li><span className="font-medium text-yellow-300">モデル自体の進化</span>：より多くのデータが蓄積されるにつれて、モデルのパラメータや式自体が修正される可能性があります</li>
              </ul>
              <p>
                これらの限界を認識した上で、パワーローモデルを投資判断の一要素として活用することが重要です。単一のモデルや指標に頼るのではなく、複数の視点から市場を分析することをお勧めします。
              </p>
            </div>
          </section>

          <section id="references" className="mt-12 pt-8 border-t border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              参考文献
            </h2>
            <div className="text-gray-300 bg-gray-800 p-4 rounded-lg space-y-3">
              <ul className="list-disc list-inside space-y-3">
                <li>
                  <a
                    href="https://giovannisantostasi.medium.com/the-bitcoin-power-law-theory-962dfaf99ee9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Giovanni Santostasi (2024) "The Bitcoin Power Law Theory"
                  </a>
                  <p className="text-sm mt-1 pl-6">
                    パワーロー理論の物理学的・数学的基礎と、ビットコイン価格にパワーローが現れる理論的根拠について詳細に解説
                  </p>
                </li>
                <li>
                  <a
                    href="https://hcburger.com/blog/powerlaw/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Harold Christopher Burger (2019) "Bitcoin's natural long-term power-law corridor of growth"
                  </a>
                  <p className="text-sm mt-1 pl-6">
                    ビットコイン価格の長期的なパワーロー成長回廊と、それを投資に活用するための実践的なフレームワークを提示
                  </p>
                </li>
                <li>
                  <a
                    href="https://www.investopedia.com/metcalfe-s-law-5202864"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Investopedia, "Metcalfe's Law"
                  </a>
                  <p className="text-sm mt-1 pl-6">
                    ネットワーク効果とビットコインの価値成長の関連性を理解するための基礎知識
                  </p>
                </li>
              </ul>
            </div>
          </section>
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
    </div>
  );
};

export default PowerLawPage;