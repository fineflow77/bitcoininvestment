import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PowerLawExplanationProps {
    chartComponent: React.ReactNode; // 追加: chartComponent を受け取る
}

const PowerLawExplanation: React.FC<PowerLawExplanationProps> = ({ chartComponent }) => {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* ヘッダー */}
                    <header className="mb-12 text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                            パワーロー（べき乗則）解説
                        </h1>
                        <p className="text-gray-400 text-lg">
                            ビットコインの長期成長を解き明かす自然の法則
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center mt-4 text-btc-accent hover:text-amber-400 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" /> ホームに戻る
                        </Link>
                    </header>

                    {/* セクション: パワーローとは */}
                    <section id="what-is-power-law" className="bg-gray-800 rounded-xl p-6 mb-8 shadow-lg">
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            パワーローとは？：ビットコイン長期予測の鍵
                        </h2>
                        <div className="text-gray-300 space-y-4">
                            <p>
                                パワーロー（べき乗則）は、自然界や社会現象で広く見られる成長のパターンです。ある量が時間や規模の累乗に比例して増えるこの法則は、対数スケールでプロットすると直線として現れます。ビットコインの価格も、このシンプルかつ強力な法則に従うと考えられています。
                            </p>
                            <p>
                                例えば、地震の規模と頻度、都市の人口分布、言語の単語使用頻度などがパワーローに従います。これらの現象は「自己相似性」を持ち、スケールが変わっても似たパターンを示します。ビットコインもまた、ネットワークの拡大や供給の特性から、この法則に沿った成長を見せています。
                            </p>
                            <p className="italic text-gray-400">
                                なぜ重要？ パワーローは、短期の乱高下を超えた長期トレンドを捉える羅針盤となり、ビットコインの未来を予測する手がかりを与えます。
                            </p>
                        </div>
                    </section>

                    {/* セクション: Santostasi の研究 */}
                    <section id="santostasi" className="bg-gray-800 rounded-xl p-6 mb-8 shadow-lg">
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            Giovanni Santostasi の研究：理論的基盤
                        </h2>
                        <div className="text-gray-300 space-y-4">
                            <p>
                                物理学者の Giovanni Santostasi は、ビットコイン価格がパワーローに従う理由を理論的に解明しました。彼の研究では、価格の長期的な成長が時間に依存する明確なパターンを持ち、対数スケールで直線的な軌跡を描くことを示しています。
                            </p>
                            <p>
                                この成長を支える要因として、Santostasi は以下を挙げています：
                            </p>
                            <ul className="list-disc list-inside space-y-2 pl-4">
                                <li>
                                    <span className="font-medium text-blue-300">自己強化フィードバック</span>：価格上昇が新たな参加者を引き込み、さらに価格を押し上げる循環。
                                </li>
                                <li>
                                    <span className="font-medium text-blue-300">難易度調整</span>：マイニングの自動調整が供給を安定させ、成長を支える。
                                </li>
                                <li>
                                    <span className="font-medium text-blue-300">ネットワーク効果</span>：利用者が増えるほど価値が飛躍的に高まる。
                                </li>
                            </ul>
                            <p className="text-sm text-gray-400">
                                Santostasi の洞察は、ビットコインが単なる投機資産ではなく、数学的法則に根ざした成長を示す可能性を浮き彫りにしています。
                            </p>
                        </div>
                    </section>

                    {/* セクション: Burger の知見 */}
                    <section id="burger" className="bg-gray-800 rounded-xl p-6 mb-8 shadow-lg">
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            HC Burger の知見：実践への応用
                        </h2>
                        <div className="text-gray-300 space-y-4">
                            <p>
                                Harold Christopher Burger は、パワーローモデルを投資戦略に活かす実践的なアプローチを提案しました。彼のフレームワークは、長期トレンドを基にした価格の「成長回廊」を定義し、投資家に具体的な指針を提供します。
                            </p>
                            <p>
                                Burger のモデルでは、以下の3つのラインが鍵となります：
                            </p>
                            <ul className="list-disc list-inside space-y-2 pl-4">
                                <li>
                                    <span className="font-medium text-green-400">中央価格</span>：価格が長期的に安定する中心ライン。
                                </li>
                                <li>
                                    <span className="font-medium text-red-400">下限価格</span>：歴史的に下回りにくいサポートレベルで、買い場とされる。
                                </li>
                                <li>
                                    <span className="font-medium text-blue-400">上限価格</span>：強気相場のピークで見られる抵抗線。
                                </li>
                            </ul>
                            <p className="text-sm italic text-gray-400">
                                これらのラインは、ビットコインの価格がどこに向かうかを視覚化し、戦略的な意思決定をサポートします。
                            </p>
                        </div>
                    </section>

                    {/* チャート表示セクション */}
                    <section id="power-law-chart" className="bg-gray-800 rounded-xl p-6 mb-8 shadow-lg">
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            パワーローモデルに基づくビットコイン価格チャート
                        </h2>
                        <div className="text-gray-300 mb-4">
                            <p>
                                以下のチャートは、パワーローモデルを用いてビットコインの価格トレンドを可視化したものです。2011年以降のデータが表示されています。
                            </p>
                        </div>
                        {chartComponent} {/* 追加: チャートを表示 */}
                    </section>

                    {/* セクション: 限界と留意点 */}
                    <section id="limitations" className="bg-gray-800 rounded-xl p-6 mb-8 shadow-lg">
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            パワーローの限界と注意点
                        </h2>
                        <div className="text-gray-300 space-y-4">
                            <p>
                                パワーローモデルは強力ですが、万能ではありません。以下の点に留意が必要です：
                            </p>
                            <ul className="list-disc list-inside space-y-2 pl-4">
                                <li>
                                    <span className="font-medium text-yellow-300">長期視点</span>：短期の価格変動や市場の感情を予測するのには不向き。
                                </li>
                                <li>
                                    <span className="font-medium text-yellow-300">過去依存</span>：規制や技術革新など、未来の不確実性を織り込めない。
                                </li>
                                <li>
                                    <span className="font-medium text-yellow-300">成長の限界</span>：永遠に急成長が続くわけではなく、いつか鈍化する可能性。
                                </li>
                                <li>
                                    <span className="font-medium text-yellow-300">モデルの進化</span>：新たなデータでモデル自体が更新されることも。
                                </li>
                            </ul>
                            <p>
                                パワーローは一つの視点に過ぎません。他の指標や市場分析と組み合わせ、バランスの取れた判断を心がけましょう。
                            </p>
                        </div>
                    </section>

                    {/* セクション: 参考文献 */}
                    <section id="references" className="mt-12 pt-8 border-t border-gray-700">
                        <h2 className="text-xl font-semibold text-white mb-4">
                            参考文献とリソース
                        </h2>
                        <div className="bg-gray-800 rounded-xl p-6 shadow-lg text-gray-300 space-y-4">
                            <ul className="space-y-4">
                                <li>
                                    <a
                                        href="https://giovannisantostasi.medium.com/the-bitcoin-power-law-theory-962dfaf99ee9"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                                    >
                                        "The Bitcoin Power Law Theory" - Giovanni Santostasi (2024)
                                    </a>
                                    <p className="text-sm text-gray-400 mt-1 pl-4">
                                        パワーローの理論的根拠とビットコインへの適用を物理学の視点から解説。
                                    </p>
                                </li>
                                <li>
                                    <a
                                        href="https://hcburger.com/blog/powerlaw/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                                    >
                                        "Bitcoin's Natural Long-Term Power-Law Corridor of Growth" - HC Burger (2019)
                                    </a>
                                    <p className="text-sm text-gray-400 mt-1 pl-4">
                                        パワーローを投資に活かす実践的フレームワークを提示。
                                    </p>
                                </li>
                                <li>
                                    <a
                                        href="https://www.investopedia.com/metcalfe-s-law-5202864"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                                    >
                                        "Metcalfe's Law" - Investopedia
                                    </a>
                                    <p className="text-sm text-gray-400 mt-1 pl-4">
                                        ネットワーク効果とビットコイン価値の関連性を学ぶ入門資料。
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* フッター */}
                    <footer className="text-center text-gray-400 mt-12 py-4 border-t border-gray-800">
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

export default PowerLawExplanation;