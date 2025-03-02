// src/utils/apiUtils.js

/**
 * タイムアウト機能付きのフェッチ関数
 * @param {string} url - フェッチするURL
 * @param {Object} options - フェッチオプション
 * @param {number} timeout - タイムアウト時間（ミリ秒）
 * @returns {Promise<Response>} - フェッチレスポンス
 */
export const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
};