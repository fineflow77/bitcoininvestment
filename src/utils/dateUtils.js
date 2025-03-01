// src/utils/dateUtils.js
import { format, parseISO } from 'date-fns';
import ja from 'date-fns/locale/ja';

export const toISODate = (date) => format(date, 'yyyy-MM-dd');

export const toJapaneseDate = (dateStr) => {
    try {
        const date = parseISO(dateStr);
        return format(date, 'PP', { locale: ja });
    } catch (e) {
        return dateStr;
    }
};

export const toShortJapaneseDate = (dateStr) => {
    try {
        const date = parseISO(dateStr);
        return format(date, 'yyyy/MM', { locale: ja });
    } catch (e) {
        return dateStr;
    }
};