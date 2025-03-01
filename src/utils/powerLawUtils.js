// src/utils/powerLawUtils.js

const GENESIS_DATE = new Date('2009-01-03');

export const calculateDaysSinceGenesis = (dateStr) => {
    const date = new Date(dateStr);
    return Math.max(1, Math.floor((date - GENESIS_DATE) / (1000 * 60 * 60 * 24)));
};

export const calculateMedianPrice = (days) => {
    return Math.pow(10, -17.01593313 + 5.84509376 * Math.log10(days));
};

export const calculateSupportPrice = (days) => {
    return Math.pow(10, -17.668) * Math.pow(days, 5.926);
};