import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="ja">
            <Head>
                {/* UTF-8のメタタグ */}
                <meta charSet="utf-8" />

                {/* Google AdSense用のメタタグと広告スクリプト */}
                <meta name="google-adsense-account" content="ca-pub-7587926675301390" />
                <script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7587926675301390"
                    crossOrigin="anonymous"
                />

                {/* ビューポートの設定 */}
                <meta name="viewport" content="width=device-width, initial-scale=1" />

                {/* favicon設定 */}
                <link rel="icon" href="/favicon.ico" />

                {/* Google Analytics等、他のスクリプトもここに追加できます */}
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}