import Head from 'next/head';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
    return (
        <>
            <Head>
                {/* Google AdSense スクリプト */}
                <script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-758792675301390"
                    crossOrigin="anonymous"
                ></script>
            </Head>
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;