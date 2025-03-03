import { useState, useEffect } from 'react';

/**
 * ビューポートがメディアクエリに一致するかどうかを追跡するカスタムフック
 * @param {string} query - メディアクエリ文字列（例: '(max-width: 640px)'）
 * @returns {boolean} クエリに一致するかどうか
 */
export const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        // 初期値を設定
        setMatches(media.matches);

        // リスナー関数
        const listener = () => setMatches(media.matches);

        // イベントリスナーの追加（ブラウザ互換性のため条件分岐）
        if (media.addEventListener) {
            media.addEventListener('change', listener);
        } else {
            // 古いブラウザ用のフォールバック
            media.addListener(listener);
        }

        // クリーンアップ関数
        return () => {
            if (media.removeEventListener) {
                media.removeEventListener('change', listener);
            } else {
                // 古いブラウザ用のフォールバック
                media.removeListener(listener);
            }
        };
    }, [query]); // クエリが変更されたときだけ再実行

    return matches;
};

export default useMediaQuery;