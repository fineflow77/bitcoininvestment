import React from "react";
import { Helmet } from "react-helmet";

const SEO = ({ title, description }) => {
    return (
        <Helmet>
            {/* ページタイトル */}
            <title>{title}</title>

            {/* ページの説明（Google 検索向け） */}
            <meta name="description" content={description} />

            {/* キーワード（Google SEO対策） */}
            <meta name="keywords" content="ビットコイン, 積立, 取り崩し, シミュレーション, 億り人, FIRE, S&P500, 長期予測, 1億, 10億, パワーロー, べき乗の法則, 将来性, 価格予測, BTC投資" />

            {/* OGP設定（SNSでの表示） */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://btcplan.jp" />
            <meta property="og:image" content="https://btcplan.jp/images/og-image.jpg" />

            {/* Twitter向けSEO */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content="https://btcplan.jp/images/twitter-image.jpg" />
        </Helmet>
    );
};

export default SEO;