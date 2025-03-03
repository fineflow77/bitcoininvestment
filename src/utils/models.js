// utils/models.js
export const btcPriceMedian = (days, model = "standard") => {
    const k = model === "standard" ? 5.84509376 : 5.75;
    return Math.pow(10, -17.01593313 + k * Math.log10(Math.max(days, 1)));
};

export const calculateDays = (year) => Math.max(Math.floor((new Date(year, 11, 31) - new Date("2009-01-03")) / (1000 * 60 * 60 * 24)), 1);