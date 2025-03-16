export const calculatePowerLawPosition = (price: number, median: number, support: number): number => {
    return ((price - median) / (median - support)) * 100;
};

export const getPowerLawPositionLabel = (position: number): string => {
    if (position < -50) return '非常に低い';
    if (position < -30) return 'かなり低い';
    if (position < -10) return 'やや低い';
    if (position <= 10) return '適正範囲';
    if (position <= 30) return 'やや高い';
    if (position <= 70) return 'かなり高い';
    return '非常に高い';
};

export const calculateRSquared = (data: [number, number][]): number => {
    if (data.length < 2) return 0;

    const x = data.map(d => d[0]);
    const y = data.map(d => d[1]);
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const meanX = sumX / n;
    const meanY = sumY / n;

    const ssTot = y.reduce((sum, yi) => sum + (yi - meanY) ** 2, 0);
    const ssRes = data.reduce((sum, [xi, yi]) => {
        const yPred = (sumXY - sumX * meanY) / (sumXX - sumX * meanX) * (xi - meanX) + meanY;
        return sum + (yi - yPred) ** 2;
    }, 0);

    return 1 - ssRes / ssTot;
};