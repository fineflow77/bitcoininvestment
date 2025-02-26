import React from 'react';

const PowerLawPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          パワーロー（べき乗則）解説
        </h1>

        <section className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-4">
            パワーローとは？：ビットコイン長期予測の基礎
          </h2>
          <div className="text-gray-300 space-y-4">
            <p>
              パワーロー、別名「べき乗則」は、自然界や社会現象に広く見られる法則です。スケールが変わってもパターンが同じという特徴を持ち、複雑な現象をシンプルに記述できます。
            </p>
            <p>
              例えば、都市の人口と経済規模にはパワーローの関係が見られます。
              また、インターネットのネットワーク価値も、利用者数の増加とともにパワーロー的に増大します。
            </p>
          </div>
        </section>

        <section className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            ビットコインのパワーローモデル：Giovanni Santostasi の研究
          </h2>
          <div className="text-gray-300 space-y-4">
            <p>
              ビットコインの長期的な価格成長を捉える「パワーローモデル」は、Giovanni Santostasi
              によって理論的に深く掘り下げられました。
            </p>
            <p>
              Santostasiは、ビットコインの価格形成には、
              自己強化的なフィードバックループ、難易度調整メカニズム、ネットワーク効果という3つの要素が組み合わさっていることを指摘しました。
              これらの要素が複雑に相互作用することで、ビットコイン価格はパワーローにしたがった長期的な成長を遂げると考えられています。
            </p>

          </div>
        </section>

        <section className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            パワーローモデルの実践的な活用：HC Burger の知見
          </h2>
          <div className="text-gray-300 space-y-4">
            <p>
              Harold Christopher Burger は、パワーローモデルを実際のビットコイン投資に応用するための
              実践的なフレームワークを提示しました。
            </p>
            <p>
              Burgerは、パワーローモデルを「中央値モデル」「下限値モデル」「抵抗線モデル」の3つのラインで表現し、
              それぞれのラインが、 歴史的な価格推移や市場のサイクルと整合性を持つことを示しました。
              これらのモデルを活用することで、投資家は市場の状況を客観的に判断し、賢明な投資戦略を立てることが可能になります。
            </p>

          </div>
        </section>

        <section className="mt-12 pt-8 border-t border-gray-700">
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
                <p className="text-sm mt-1">
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
                <p className="text-sm mt-1">
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
  );
};

export default PowerLawPage;