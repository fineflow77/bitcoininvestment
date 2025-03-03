export const apiRequest = async (method, url, params = {}, headers = {}, timeout = 10000) => {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${url}?${queryString}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(fullUrl, {
            method,
            headers: { 'Accept': 'application/json', ...headers },
            signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') throw new Error('API request timed out');
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
};