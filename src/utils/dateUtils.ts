import { differenceInDays, format } from 'date-fns';
import { ja } from 'date-fns/locale';

export const BITCOIN_GENESIS_DATE: Date = new Date('2009-01-03T00:00:00Z');

export const getDaysSinceGenesis = (date: Date): number => differenceInDays(date, BITCOIN_GENESIS_DATE);

export const toISODate = (dateStr: string | Date): string => {
    const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
    return date.toISOString().split('T')[0];
};

export const toJapaneseDate = (dateStr: string | Date): string => {
    const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
    return format(date, 'yyyy年MM月dd日', { locale: ja });
};

export const toShortJapaneseDate = (dateStr: string | Date): string => {
    const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
    return format(date, 'MM月dd日', { locale: ja });
};

export const calculateDays = (year: number): number => {
    const date = new Date(year, 11, 31); // 12月31日
    return getDaysSinceGenesis(date);
};

export const calculateDateRange = <T>(data: Array<T>, range: string): { startIndex: number; endIndex: number } => {
    if (!data || data.length === 0) return { startIndex: 0, endIndex: 0 };

    const endIndex = data.length - 1;
    let startIndex = 0;
    const today = new Date();

    switch (range) {
        case '10y':
            const tenYearsAgo = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
            startIndex = Math.max(0, data.findIndex((item: any) => new Date(item[0]) >= tenYearsAgo));
            break;
        case '5y':
            const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
            startIndex = Math.max(0, data.findIndex((item: any) => new Date(item[0]) >= fiveYearsAgo));
            break;
        case '2y':
            const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
            startIndex = Math.max(0, data.findIndex((item: any) => new Date(item[0]) >= twoYearsAgo));
            break;
        case '1y':
            const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
            startIndex = Math.max(0, data.findIndex((item: any) => new Date(item[0]) >= oneYearAgo));
            break;
        case '6m':
            const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
            startIndex = Math.max(0, data.findIndex((item: any) => new Date(item[0]) >= sixMonthsAgo));
            break;
        case 'all':
        default:
            startIndex = 0;
            break;
    }

    return { startIndex, endIndex };
};