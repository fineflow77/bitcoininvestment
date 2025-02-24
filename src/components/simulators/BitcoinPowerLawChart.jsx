import { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { HelpCircle } from 'lucide-react'; // HelpCircle をインポート

// ビットコインの起源日
const GENESIS_DATE = new Date('2009-01-03');

// 色の定義
const COLORS = {
    price: '#FFA500',      // オレンジ（実価格）
    median: '#00FF00',     // 緑（中央値）
    support: '#FF0000'     // 赤（下限値）
};
// 週次価格データ (以前提供されたデータを使用)
const WEEKLY_PRICES = [
    { date: '2010-07-18', price: 0.10 },
    { date: '2010-07-25', price: 0.10 },
    { date: '2010-08-01', price: 0.10 },
    { date: '2010-08-08', price: 0.10 },
    { date: '2010-08-15', price: 0.10 },
    { date: '2010-08-22', price: 0.10 },
    { date: '2010-08-29', price: 0.10 },
    { date: '2010-09-05', price: 0.10 },
    { date: '2010-09-12', price: 0.10 },
    { date: '2010-09-19', price: 0.10 },
    { date: '2010-09-26', price: 0.10 },
    { date: '2010-10-03', price: 0.10 },
    { date: '2010-10-10', price: 0.10 },
    { date: '2010-10-17', price: 0.10 },
    { date: '2010-10-24', price: 0.20 },
    { date: '2010-10-31', price: 0.40 },
    { date: '2010-11-07', price: 0.30 },
    { date: '2010-11-14', price: 0.30 },
    { date: '2010-11-21', price: 0.30 },
    { date: '2010-11-28', price: 0.20 },
    { date: '2010-12-05', price: 0.20 },
    { date: '2010-12-12', price: 0.20 },
    { date: '2010-12-19', price: 0.20 },
    { date: '2010-12-26', price: 0.30 },
    { date: '2011-01-02', price: 0.30 },
    { date: '2011-01-09', price: 0.40 },
    { date: '2011-01-16', price: 0.40 },
    { date: '2011-01-23', price: 0.40 },
    { date: '2011-01-30', price: 0.90 },
    { date: '2011-02-06', price: 1.10 },
    { date: '2011-02-13', price: 0.90 },
    { date: '2011-02-20', price: 1.00 },
    { date: '2011-02-27', price: 0.90 },
    { date: '2011-03-06', price: 0.90 },
    { date: '2011-03-13', price: 0.80 },
    { date: '2011-03-20', price: 0.90 },
    { date: '2011-03-27', price: 0.80 },
    { date: '2011-04-03', price: 0.70 },
    { date: '2011-04-10', price: 1.00 },
    { date: '2011-04-17', price: 1.70 },
    { date: '2011-04-24', price: 3.50 },
    { date: '2011-05-01', price: 3.60 },
    { date: '2011-05-08', price: 7.20 },
    { date: '2011-05-15', price: 6.10 },
    { date: '2011-05-22', price: 8.30 },
    { date: '2011-05-29', price: 18.90 },
    { date: '2011-06-05', price: 14.60 },
    { date: '2011-06-12', price: 16.90 },
    { date: '2011-06-19', price: 17.50 },
    { date: '2011-06-26', price: 15.40 },
    { date: '2011-07-03', price: 14.40 },
    { date: '2011-07-10', price: 13.70 },
    { date: '2011-07-17', price: 13.70 },
    { date: '2011-07-24', price: 13.50 },
    { date: '2011-07-31', price: 6.60 },
    { date: '2011-08-07', price: 10.10 },
    { date: '2011-08-14', price: 11.40 },
    { date: '2011-08-21', price: 8.60 },
    { date: '2011-08-28', price: 8.50 },
    { date: '2011-09-04', price: 4.80 },
    { date: '2011-09-11', price: 4.80 },
    { date: '2011-09-18', price: 5.50 },
    { date: '2011-09-25', price: 5.00 },
    { date: '2011-10-02', price: 4.00 },
    { date: '2011-10-09', price: 3.80 },
    { date: '2011-10-16', price: 3.20 },
    { date: '2011-10-23', price: 3.60 },
    { date: '2011-10-30', price: 3.00 },
    { date: '2011-11-06', price: 3.00 },
    { date: '2011-11-13', price: 2.20 },
    { date: '2011-11-20', price: 2.50 },
    { date: '2011-11-27', price: 2.80 },
    { date: '2011-12-04', price: 3.00 },
    { date: '2011-12-11', price: 3.20 },
    { date: '2011-12-18', price: 3.90 },
    { date: '2011-12-25', price: 4.70 },
    { date: '2012-01-01', price: 6.80 },
    { date: '2012-01-08', price: 6.80 },
    { date: '2012-01-15', price: 6.20 },
    { date: '2012-01-22', price: 5.60 },
    { date: '2012-01-29', price: 5.90 },
    { date: '2012-02-05', price: 5.60 },
    { date: '2012-02-12', price: 4.20 },
    { date: '2012-02-19', price: 4.80 },
    { date: '2012-02-26', price: 4.60 },
    { date: '2012-03-04', price: 4.80 },
    { date: '2012-03-11', price: 5.20 },
    { date: '2012-03-18', price: 4.70 },
    { date: '2012-03-25', price: 4.90 },
    { date: '2012-04-01', price: 4.70 },
    { date: '2012-04-08', price: 5.00 },
    { date: '2012-04-15', price: 5.30 },
    { date: '2012-04-22', price: 5.00 },
    { date: '2012-04-29', price: 5.10 },
    { date: '2012-05-06', price: 4.90 },
    { date: '2012-05-13', price: 5.10 },
    { date: '2012-05-20', price: 5.10 },
    { date: '2012-05-27', price: 5.30 },
    { date: '2012-06-03', price: 5.60 },
    { date: '2012-06-10', price: 6.40 },
    { date: '2012-06-17', price: 6.40 },
    { date: '2012-06-24', price: 6.70 },
    { date: '2012-07-01', price: 6.80 },
    { date: '2012-07-08', price: 7.50 },
    { date: '2012-07-15', price: 8.90 },
    { date: '2012-07-22', price: 8.90 },
    { date: '2012-07-29', price: 11.00 },
    { date: '2012-08-05', price: 11.50 },
    { date: '2012-08-12', price: 11.60 },
    { date: '2012-08-19', price: 10.50 },
    { date: '2012-08-26', price: 10.00 },
    { date: '2012-09-02', price: 11.00 },
    { date: '2012-09-09', price: 11.80 },
    { date: '2012-09-16', price: 12.20 },
    { date: '2012-09-23', price: 12.40 },
    { date: '2012-09-30', price: 12.50 },
    { date: '2012-10-07', price: 11.90 },
    { date: '2012-10-14', price: 11.70 },
    { date: '2012-10-21', price: 10.30 },
    { date: '2012-10-28', price: 10.60 },
    { date: '2012-11-04', price: 10.90 },
    { date: '2012-11-11', price: 11.80 },
    { date: '2012-11-18', price: 12.40 },
    { date: '2012-11-25', price: 12.60 },
    { date: '2012-12-02', price: 13.40 },
    { date: '2012-12-09', price: 13.50 },
    { date: '2012-12-16', price: 13.40 },
    { date: '2012-12-23', price: 13.40 },
    { date: '2012-12-30', price: 13.40 },
    { date: '2013-01-06', price: 14.20 },
    { date: '2013-01-13', price: 15.60 },
    { date: '2013-01-20', price: 17.90 },
    { date: '2013-01-27', price: 19.60 },
    { date: '2013-02-03', price: 23.60 },
    { date: '2013-02-10', price: 27.20 },
    { date: '2013-02-17', price: 29.80 },
    { date: '2013-02-24', price: 34.30 },
    { date: '2013-03-03', price: 46.80 },
    { date: '2013-03-10', price: 47.00 },
    { date: '2013-03-17', price: 64.30 },
    { date: '2013-03-24', price: 92.20 },
    { date: '2013-03-31', price: 142.60 },
    { date: '2013-04-07', price: 93.00 },
    { date: '2013-04-14', price: 126.60 },
    { date: '2013-04-21', price: 128.00 },
    { date: '2013-04-28', price: 112.90 },
    { date: '2013-05-05', price: 115.60 },
    { date: '2013-05-12', price: 123.20 },
    { date: '2013-05-19', price: 132.00 },
    { date: '2013-05-26', price: 129.30 },
    { date: '2013-06-02', price: 107.90 },
    { date: '2013-06-09', price: 99.80 },
    { date: '2013-06-16', price: 108.20 },
    { date: '2013-06-23', price: 95.00 },
    { date: '2013-06-30', price: 69.70 },
    { date: '2013-07-07', price: 98.30 },
    { date: '2013-07-14', price: 89.80 },
    { date: '2013-07-21', price: 94.40 },
    { date: '2013-07-28', price: 104.90 },
    { date: '2013-08-04', price: 103.00 },
    { date: '2013-08-11', price: 112.80 },
    { date: '2013-08-18', price: 119.60 },
    { date: '2013-08-25', price: 141.00 },
    { date: '2013-09-01', price: 129.00 },
    { date: '2013-09-08', price: 136.70 },
    { date: '2013-09-15', price: 134.40 },
    { date: '2013-09-22', price: 142.50 },
    { date: '2013-09-29', price: 136.70 },
    { date: '2013-10-06', price: 142.90 },
    { date: '2013-10-13', price: 183.10 },
    { date: '2013-10-20', price: 188.60 },
    { date: '2013-10-27', price: 211.70 },
    { date: '2013-11-03', price: 367.80 },
    { date: '2013-11-10', price: 462.00 },
    { date: '2013-11-17', price: 832.50 },
    { date: '2013-11-24', price: 1205.70 },
    { date: '2013-12-01', price: 697.00 },
    { date: '2013-12-08', price: 908.90 },
    { date: '2013-12-15', price: 640.50 },
    { date: '2013-12-22', price: 762.00 },
    { date: '2013-12-29', price: 924.70 },
    { date: '2014-01-05', price: 1005.30 },
    { date: '2014-01-12', price: 905.70 },
    { date: '2014-01-19', price: 961.00 },
    { date: '2014-01-26', price: 940.40 },
    { date: '2014-02-02', price: 648.80 },
    { date: '2014-02-09', price: 371.10 },
    { date: '2014-02-16', price: 255.60 },
    { date: '2014-02-23', price: 557.40 },
    { date: '2014-03-02', price: 609.20 },
    { date: '2014-03-09', price: 624.00 },
    { date: '2014-03-16', price: 564.30 },
    { date: '2014-03-23', price: 477.10 },
    { date: '2014-03-30', price: 456.60 },
    { date: '2014-04-06', price: 437.60 },
    { date: '2014-04-13', price: 506.00 },
    { date: '2014-04-20', price: 457.90 },
    { date: '2014-04-27', price: 438.60 },
    { date: '2014-05-04', price: 451.90 },
    { date: '2014-05-11', price: 452.80 },
    { date: '2014-05-18', price: 520.50 },
    { date: '2014-05-25', price: 627.90 },
    { date: '2014-06-01', price: 651.70 },
    { date: '2014-06-08', price: 583.40 },
    { date: '2014-06-15', price: 597.00 },
    { date: '2014-06-22', price: 597.60 },
    { date: '2014-06-29', price: 623.00 },
    { date: '2014-07-06', price: 635.90 },
    { date: '2014-07-13', price: 627.00 },
    { date: '2014-07-20', price: 596.00 },
    { date: '2014-07-27', price: 591.70 },
    { date: '2014-08-03', price: 589.50 },
    { date: '2014-08-10', price: 522.00 },
    { date: '2014-08-17', price: 497.70 },
    { date: '2014-08-24', price: 506.00 },
    { date: '2014-08-31', price: 484.50 },
    { date: '2014-09-07', price: 478.20 },
    { date: '2014-09-14', price: 411.50 },
    { date: '2014-09-21', price: 399.00 },
    { date: '2014-09-28', price: 335.30 },
    { date: '2014-10-05', price: 361.20 },
    { date: '2014-10-12', price: 390.90 },
    { date: '2014-10-19', price: 346.70 },
    { date: '2014-10-26', price: 325.40 },
    { date: '2014-11-02', price: 343.50 },
    { date: '2014-11-09', price: 374.90 },
    { date: '2014-11-16', price: 352.00 },
    { date: '2014-11-23', price: 376.30 },
    { date: '2014-11-30', price: 376.30 },
    { date: '2014-12-07', price: 348.20 },
    { date: '2014-12-14', price: 330.40 },
    { date: '2014-12-21', price: 315.30 },
    { date: '2014-12-21', price: 315.30 },
    { date: '2014-12-28', price: 287.10 },
    { date: '2015-01-04', price: 273.40 },
    { date: '2015-01-11', price: 199.60 },
    { date: '2015-01-18', price: 248.20 },
    { date: '2015-01-25', price: 218.50 },
    { date: '2015-02-01', price: 227.70 },
    { date: '2015-02-08', price: 258.60 },
    { date: '2015-02-15', price: 244.40 },
    { date: '2015-02-22', price: 254.10 },
    { date: '2015-03-01', price: 274.90 },
    { date: '2015-03-08', price: 281.60 },
    { date: '2015-03-15', price: 259.70 },
    { date: '2015-03-22', price: 252.00 },
    { date: '2015-03-29', price: 252.90 },
    { date: '2015-04-05', price: 236.50 },
    { date: '2015-04-12', price: 223.40 },
    { date: '2015-04-19', price: 226.10 },
    { date: '2015-04-26', price: 235.30 },
    { date: '2015-05-03', price: 241.40 },
    { date: '2015-05-10', price: 236.20 },
    { date: '2015-05-17', price: 238.90 },
    { date: '2015-05-24', price: 233.20 },
    { date: '2015-05-31', price: 224.70 },
    { date: '2015-06-07', price: 232.50 },
    { date: '2015-06-14', price: 245.00 },
    { date: '2015-06-21', price: 250.70 },
    { date: '2015-06-28', price: 260.50 },
    { date: '2015-07-05', price: 292.00 },
    { date: '2015-07-12', price: 274.00 },
    { date: '2015-07-19', price: 288.70 },
    { date: '2015-07-26', price: 280.50 },
    { date: '2015-08-02', price: 258.60 },
    { date: '2015-08-09', price: 260.50 },
    { date: '2015-08-16', price: 229.50 },
    { date: '2015-08-23', price: 228.50 },
    { date: '2015-08-30', price: 233.70 },
    { date: '2015-09-06', price: 235.60 },
    { date: '2015-09-13', price: 231.10 },
    { date: '2015-09-20', price: 234.30 },
    { date: '2015-09-27', price: 238.60 },
    { date: '2015-10-04', price: 245.40 },
    { date: '2015-10-11', price: 269.60 },
    { date: '2015-10-18', price: 282.60 },
    { date: '2015-10-25', price: 311.20 },
    { date: '2015-11-01', price: 385.10 },
    { date: '2015-11-08', price: 331.80 },
    { date: '2015-11-15', price: 324.70 },
    { date: '2015-11-22', price: 355.80 },
    { date: '2015-11-29', price: 386.70 },
    { date: '2015-12-06', price: 432.30 },
    { date: '2015-12-13', price: 461.20 },
    { date: '2015-12-20', price: 415.40 },
    { date: '2015-12-27', price: 433.70 },
    { date: '2016-01-03', price: 448.30 },
    { date: '2016-01-10', price: 385.00 },
    { date: '2016-01-17', price: 388.60 },
    { date: '2016-01-24', price: 377.80 },
    { date: '2016-01-31', price: 376.70 },
    { date: '2016-02-07', price: 390.10 },
    { date: '2016-02-14', price: 440.10 },
    { date: '2016-02-21', price: 431.30 },
    { date: '2016-02-28', price: 399.00 },
    { date: '2016-03-06', price: 410.40 },
    { date: '2016-03-13', price: 408.70 },
    { date: '2016-03-20', price: 416.50 },
    { date: '2016-03-27', price: 418.50 },
    { date: '2016-04-03', price: 418.00 },
    { date: '2016-04-10', price: 430.00 },
    { date: '2016-04-17', price: 450.10 },
    { date: '2016-04-24', price: 448.50 },
    { date: '2016-05-01', price: 458.50 },
    { date: '2016-05-08', price: 456.40 },
    { date: '2016-05-15', price: 443.60 },
    { date: '2016-05-22', price: 524.20 },
    { date: '2016-05-29', price: 572.00 },
    { date: '2016-06-05', price: 591.60 },
    { date: '2016-06-12', price: 753.80 },
    { date: '2016-06-19', price: 663.50 },
    { date: '2016-06-26', price: 698.10 },
    { date: '2016-07-03', price: 651.80 },
    { date: '2016-07-10', price: 660.70 },
    { date: '2016-07-17', price: 655.20 },
    { date: '2016-07-24', price: 654.70 },
    { date: '2016-07-31', price: 586.50 },
    { date: '2016-08-07', price: 584.60 },
    { date: '2016-08-14', price: 582.60 },
    { date: '2016-08-21', price: 570.30 },
    { date: '2016-08-28', price: 598.80 },
    { date: '2016-09-04', price: 624.50 },
    { date: '2016-09-11', price: 607.10 },
    { date: '2016-09-18', price: 602.60 },
    { date: '2016-09-25', price: 613.40 },
    { date: '2016-10-02', price: 617.70 },
    { date: '2016-10-09', price: 637.00 },
    { date: '2016-10-16', price: 655.50 },
    { date: '2016-10-23', price: 715.00 },
    { date: '2016-10-30', price: 702.10 },
    { date: '2016-11-06', price: 704.30 },
    { date: '2016-11-13', price: 747.90 },
    { date: '2016-11-20', price: 734.10 },
    { date: '2016-11-27', price: 764.20 },
    { date: '2016-12-04', price: 774.00 },
    { date: '2016-12-11', price: 787.20 },
    { date: '2016-12-18', price: 891.10 },
    { date: '2016-12-25', price: 963.40 },
    { date: '2017-01-01', price: 888.90 },
    { date: '2017-01-08', price: 819.60 },
    { date: '2017-01-15', price: 919.80 },
    { date: '2017-01-22', price: 918.50 },
    { date: '2017-01-29', price: 1031.80 },
    { date: '2017-02-05', price: 1008.30 },
    { date: '2017-02-12', price: 1052.30 },
    { date: '2017-02-19', price: 1149.10 },
    { date: '2017-02-26', price: 1264.30 },
    { date: '2017-03-05', price: 1179.20 },
    { date: '2017-03-12', price: 971.40 },
    { date: '2017-03-19', price: 966.30 },
    { date: '2017-03-26', price: 1086.10 },
    { date: '2017-04-02', price: 1180.80 },
    { date: '2017-04-09', price: 1177.00 },
    { date: '2017-04-16', price: 1240.90 },
    { date: '2017-04-23', price: 1336.30 },
    { date: '2017-04-30', price: 1545.30 },
    { date: '2017-05-07', price: 1763.70 },
    { date: '2017-05-14', price: 2040.20 },
    { date: '2017-05-21', price: 2052.40 },
    { date: '2017-05-28', price: 2545.40 },
    { date: '2017-06-04', price: 2900.30 },
    { date: '2017-06-11', price: 2655.10 },
    { date: '2017-06-18', price: 2590.10 },
    { date: '2017-06-25', price: 2424.60 },
    { date: '2017-07-02', price: 2564.90 },
    { date: '2017-07-09', price: 1975.10 },
    { date: '2017-07-16', price: 2836.50 },
    { date: '2017-07-23', price: 2733.50 },
    { date: '2017-07-30', price: 3262.80 },
    { date: '2017-08-06', price: 3871.60 },
    { date: '2017-08-13', price: 4150.50 },
    { date: '2017-08-20', price: 4352.30 },
    { date: '2017-08-27', price: 4573.80 },
    { date: '2017-09-03', price: 4335.10 },
    { date: '2017-09-10', price: 3698.90 },
    { date: '2017-09-17', price: 3788.00 },
    { date: '2017-09-24', price: 4360.60 },
    { date: '2017-10-01', price: 4435.80 },
    { date: '2017-10-08', price: 5824.70 },
    { date: '2017-10-15', price: 6006.60 },
    { date: '2017-10-22', price: 5726.60 },
    { date: '2017-10-29', price: 7363.80 },
    { date: '2017-11-05', price: 6339.90 },
    { date: '2017-11-12', price: 7780.90 },
    { date: '2017-11-19', price: 8754.70 },
    { date: '2017-11-26', price: 10912.70 },
    { date: '2017-12-03', price: 14843.40 },
    { date: '2017-12-10', price: 19345.50 },
    { date: '2017-12-17', price: 14396.50 },
    { date: '2017-12-24', price: 12531.50 },
    { date: '2017-12-31', price: 17172.30 },
    { date: '2018-01-07', price: 14292.20 },
    { date: '2018-01-14', price: 12858.90 },
    { date: '2018-01-21', price: 11467.50 },
    { date: '2018-01-28', price: 9241.10 },
    { date: '2018-02-04', price: 8559.60 },
    { date: '2018-02-11', price: 11073.50 },
    { date: '2018-02-18', price: 9704.30 },
    { date: '2018-02-25', price: 11402.30 },
    { date: '2018-03-04', price: 8762.00 },
    { date: '2018-03-11', price: 7874.90 },
    { date: '2018-03-18', price: 8547.40 },
    { date: '2018-03-25', price: 6938.20 },
    { date: '2018-04-01', price: 6905.70 },
    { date: '2018-04-08', price: 8004.40 },
    { date: '2018-04-15', price: 8923.10 },
    { date: '2018-04-22', price: 9352.40 },
    { date: '2018-04-29', price: 9853.50 },
    { date: '2018-05-06', price: 8459.50 },
    { date: '2018-05-13', price: 8245.10 },
    { date: '2018-05-20', price: 7361.30 },
    { date: '2018-05-27', price: 7646.60 },
    { date: '2018-06-03', price: 7515.80 },
    { date: '2018-06-10', price: 6505.80 },
    { date: '2018-06-17', price: 6167.30 },
    { date: '2018-06-24', price: 6398.90 },
    { date: '2018-07-01', price: 6765.50 },
    { date: '2018-07-08', price: 6254.80 },
    { date: '2018-07-15', price: 7408.70 },
    { date: '2018-07-22', price: 8234.10 },
    { date: '2018-07-29', price: 7014.30 },
    { date: '2018-08-05', price: 6231.60 },
    { date: '2018-08-12', price: 6379.10 },
    { date: '2018-08-19', price: 6734.80 },
    { date: '2018-08-26', price: 7189.60 },
    { date: '2018-09-02', price: 6184.30 },
    { date: '2018-09-09', price: 6519.00 },
    { date: '2018-09-16', price: 6729.60 },
    { date: '2018-09-23', price: 6603.90 },
    { date: '2018-09-30', price: 6596.30 },
    { date: '2018-10-07', price: 6321.70 },
    { date: '2018-10-14', price: 6572.20 },
    { date: '2018-10-21', price: 6494.20 },
    { date: '2018-10-28', price: 6386.20 },
    { date: '2018-11-04', price: 6427.10 },
    { date: '2018-11-11', price: 5621.80 },
    { date: '2018-11-18', price: 3920.40 },
    { date: '2018-11-25', price: 4196.20 },
    { date: '2018-12-02', price: 3430.40 },
    { date: '2018-12-09', price: 3228.70 },
    { date: '2018-12-16', price: 3964.40 },
    { date: '2018-12-23', price: 3706.80 },
    { date: '2018-12-30', price: 3785.40 },
    { date: '2019-01-06', price: 3597.20 },
    { date: '2019-01-13', price: 3677.80 },
    { date: '2019-01-20', price: 3570.90 },
    { date: '2019-01-27', price: 3502.50 },
    { date: '2019-02-03', price: 3661.40 },
    { date: '2019-02-10', price: 3616.80 },
    { date: '2019-02-17', price: 4120.40 },
    { date: '2019-02-24', price: 3823.10 },
    { date: '2019-03-03', price: 3944.30 },
    { date: '2019-03-10', price: 4006.40 },
    { date: '2019-03-17', price: 4002.50 },
    { date: '2019-03-24', price: 4111.80 },
    { date: '2019-03-31', price: 5046.20 },
    { date: '2019-04-07', price: 5051.80 },
    { date: '2019-04-14', price: 5290.20 },
    { date: '2019-04-21', price: 5265.90 },
    { date: '2019-04-28', price: 5830.90 },
    { date: '2019-05-05', price: 7190.30 },
    { date: '2019-05-12', price: 7262.60 },
    { date: '2019-05-19', price: 8027.40 },
    { date: '2019-05-26', price: 8545.70 },
    { date: '2019-06-02', price: 7901.40 },
    { date: '2019-06-09', price: 8812.50 },
    { date: '2019-06-16', price: 10721.70 },
    { date: '2019-06-23', price: 11906.50 },
    { date: '2019-06-30', price: 11268.00 },
    { date: '2019-07-07', price: 11364.90 },
    { date: '2019-07-14', price: 10826.70 },
    { date: '2019-07-21', price: 9492.10 },
    { date: '2019-07-28', price: 10815.70 },
    { date: '2019-08-04', price: 11314.50 },
    { date: '2019-08-11', price: 10218.10 },
    { date: '2019-08-18', price: 10131.00 },
    { date: '2019-08-25', price: 9594.40 },
    { date: '2019-09-01', price: 10461.10 },
    { date: '2019-09-08', price: 10337.30 },
    { date: '2019-09-15', price: 9993.00 },
    { date: '2019-09-22', price: 8208.50 },
    { date: '2019-09-29', price: 8127.30 },
    { date: '2019-10-06', price: 8304.40 },
    { date: '2019-10-13', price: 7957.30 },
    { date: '2019-10-20', price: 9230.60 },
    { date: '2019-10-27', price: 9300.60 },
    { date: '2019-11-03', price: 8804.50 },
    { date: '2019-11-10', price: 8497.30 },
    { date: '2019-11-17', price: 7324.10 },
    { date: '2019-11-24', price: 7546.60 },
    { date: '2019-12-01', price: 7510.90 },
    { date: '2019-12-08', price: 7080.80 },
    { date: '2019-12-15', price: 7156.20 },
    { date: '2019-12-22', price: 7321.50 },
    { date: '2019-12-29', price: 7376.80 },
    { date: '2020-01-05', price: 8024.10 },
    { date: '2020-01-12', price: 8916.30 },
    { date: '2020-01-19', price: 8341.60 },
    { date: '2020-01-26', price: 9381.60 },
    { date: '2020-02-02', price: 9895.50 },
    { date: '2020-02-09', price: 9907.70 },
    { date: '2020-02-16', price: 9655.70 },
    { date: '2020-02-23', price: 8543.70 },
    { date: '2020-03-01', price: 8887.80 },
    { date: '2020-03-08', price: 5182.70 },
    { date: '2020-03-15', price: 6186.20 },
    { date: '2020-03-22', price: 6233.70 },
    { date: '2020-03-29', price: 6857.40 },
    { date: '2020-04-05', price: 6867.80 },
    { date: '2020-04-12', price: 7230.80 },
    { date: '2020-04-19', price: 7540.40 },
    { date: '2020-04-26', price: 8966.30 },
    { date: '2020-05-03', price: 9554.60 },
    { date: '2020-05-10', price: 9379.50 },
    { date: '2020-05-17', price: 9177.00 },
    { date: '2020-05-24', price: 9692.50 },
    { date: '2020-05-31', price: 9669.60 },
    { date: '2020-06-07', price: 9471.30 },
    { date: '2020-06-14', price: 9358.80 },
    { date: '2020-06-21', price: 9008.30 },
    { date: '2020-06-28', price: 9134.40 },
    { date: '2020-07-05', price: 9233.30 },
    { date: '2020-07-12', price: 9170.20 },
    { date: '2020-07-19', price: 9704.10 },
    { date: '2020-07-26', price: 11803.10 },
    { date: '2020-08-02', price: 11764.30 },
    { date: '2020-08-09', price: 11845.30 },
    { date: '2020-08-16', price: 11661.30 },
    { date: '2020-08-23', price: 11468.10 },
    { date: '2020-08-30', price: 10092.20 },
    { date: '2020-09-06', price: 10441.90 },
    { date: '2020-09-13', price: 11081.80 },
    { date: '2020-09-20', price: 10727.90 },
    { date: '2020-09-27', price: 10544.20 },
    { date: '2020-10-04', price: 11298.40 },
    { date: '2020-10-11', price: 11362.10 },
    { date: '2020-10-18', price: 13117.20 },
    { date: '2020-10-25', price: 13797.30 },
    { date: '2020-11-01', price: 14828.40 },
    { date: '2020-11-08', price: 16071.00 },
    { date: '2020-11-15', price: 18687.20 },
    { date: '2020-11-22', price: 17730.70 },
    { date: '2020-11-29', price: 19146.50 },
    { date: '2020-12-06', price: 18808.90 },
    { date: '2020-12-13', price: 23844.00 },
    { date: '2020-12-20', price: 26454.40 },
    { date: '2020-12-27', price: 32193.30 },
    { date: '2021-01-03', price: 40151.90 },
    { date: '2021-01-10', price: 36019.50 },
    { date: '2021-01-17', price: 32088.90 },
    { date: '2021-01-24', price: 34283.10 },
    { date: '2021-01-31', price: 39256.60 },
    { date: '2021-02-07', price: 47168.70 },
    { date: '2021-02-14', price: 55923.70 },
    { date: '2021-02-21', price: 46136.70 },
    { date: '2021-02-28', price: 48855.60 },
    { date: '2021-03-07', price: 61195.30 },
    { date: '2021-03-14', price: 58093.40 },
    { date: '2021-03-21', price: 55862.90 },
    { date: '2021-03-28', price: 57059.90 },
    { date: '2021-04-04', price: 59748.40 },
    { date: '2021-04-11', price: 60041.90 },
    { date: '2021-04-18', price: 50088.90 },
    { date: '2021-04-25', price: 57807.10 },
    { date: '2021-05-02', price: 58840.10 },
    { date: '2021-05-09', price: 46708.80 },
    { date: '2021-05-16', price: 37448.30 },
    { date: '2021-05-23', price: 34584.60 },
    { date: '2021-05-30', price: 35520.00 },
    { date: '2021-06-06', price: 35467.50 },
    { date: '2021-06-13', price: 35513.40 },
    { date: '2021-06-20', price: 32243.40 },
    { date: '2021-06-27', price: 34742.80 },
    { date: '2021-07-04', price: 33510.60 },
    { date: '2021-07-11', price: 31518.60 },
    { date: '2021-07-18', price: 33824.80 },
    { date: '2021-07-25', price: 41553.70 },
    { date: '2021-08-01', price: 44614.20 },
    { date: '2021-08-08', price: 47081.50 },
    { date: '2021-08-15', price: 48875.80 },
    { date: '2021-08-22', price: 48897.10 },
    { date: '2021-08-29', price: 49918.40 },
    { date: '2021-09-05', price: 45161.90 },
    { date: '2021-09-12', price: 48306.70 },
    { date: '2021-09-19', price: 42686.80 },
    { date: '2021-09-26', price: 47666.90 },
    { date: '2021-10-03', price: 54942.50 },
    { date: '2021-10-10', price: 60861.10 },
    { date: '2021-10-17', price: 61312.50 },
    { date: '2021-10-24', price: 61840.10 },
    { date: '2021-10-31', price: 61483.90 },
    { date: '2021-11-07', price: 64398.60 },
    { date: '2021-11-14', price: 59717.60 },
    { date: '2021-11-21', price: 54765.90 },
    { date: '2021-11-28', price: 49195.20 },
    { date: '2021-12-05', price: 49314.50 },
    { date: '2021-12-12', price: 46856.20 },
    { date: '2021-12-19', price: 50406.40 },
    { date: '2021-12-26', price: 47738.00 },
    { date: '2022-01-02', price: 41672.00 },
    { date: '2022-01-09', price: 43097.00 },
    { date: '2022-01-16', price: 35075.20 },
    { date: '2022-01-23', price: 38170.80 },
    { date: '2022-01-30', price: 41412.10 },
    { date: '2022-02-06', price: 42205.20 },
    { date: '2022-02-13', price: 40090.30 },
    { date: '2022-02-20', price: 39115.50 },
    { date: '2022-02-27', price: 39395.80 },
    { date: '2022-03-06', price: 38814.30 },
    { date: '2022-03-13', price: 42233.00 },
    { date: '2022-03-20', price: 44548.00 },
    { date: '2022-03-27', price: 45811.00 },
    { date: '2022-04-03', price: 42767.00 },
    { date: '2022-04-10', price: 40382.00 },
    { date: '2022-04-17', price: 39418.00 },
    { date: '2022-04-24', price: 37650.00 },
    { date: '2022-05-01', price: 35468.00 },
    { date: '2022-05-08', price: 30080.40 },
    { date: '2022-05-15', price: 29434.60 },
    { date: '2022-05-22', price: 29027.10 },
    { date: '2022-05-29', price: 29864.30 },
    { date: '2022-06-05', price: 28403.40 },
    { date: '2022-06-12', price: 18986.50 },
    { date: '2022-06-19', price: 21489.90 },
    { date: '2022-06-26', price: 19243.20 },
    { date: '2022-07-03', price: 21587.50 },
    { date: '2022-07-10', price: 21209.90 },
    { date: '2022-07-17', price: 22460.40 },
    { date: '2022-07-24', price: 23634.20 },
    { date: '2022-07-31', price: 22944.20 },
    { date: '2022-08-07', price: 24442.50 },
    { date: '2022-08-14', price: 21138.90 },
    { date: '2022-08-21', price: 20033.90 },
    { date: '2022-08-28', price: 19831.40 },
    { date: '2022-09-04', price: 21650.40 },
    { date: '2022-09-11', price: 20113.50 },
    { date: '2022-09-18', price: 18925.20 },
    { date: '2022-09-25', price: 19311.90 },
    { date: '2022-10-02', price: 19415.00 },
    { date: '2022-10-09', price: 19068.70 },
    { date: '2022-10-16', price: 19204.80 },
    { date: '2022-10-23', price: 20809.80 },
    { date: '2022-10-30', price: 21301.60 },
    { date: '2022-11-06', price: 16795.20 },
    { date: '2022-11-13', price: 16699.20 },
    { date: '2022-11-20', price: 16456.50 },
    { date: '2022-11-27', price: 16884.50 },
    { date: '2022-12-04', price: 17127.20 },
    { date: '2022-12-11', price: 16777.10 },
    { date: '2022-12-18', price: 16837.20 },
    { date: '2022-12-25', price: 16537.40 },
    { date: '2023-01-01', price: 16943.60 },
    { date: '2023-01-08', price: 20958.20 },
    { date: '2023-01-15', price: 22775.70 },
    { date: '2023-01-22', price: 23027.90 },
    { date: '2023-01-29', price: 23323.80 },
    { date: '2023-02-05', price: 21859.80 },
    { date: '2023-02-12', price: 24631.40 },
    { date: '2023-02-19', price: 23166.10 },
    { date: '2023-02-26', price: 22347.10 },
    { date: '2023-03-05', price: 20467.50 },
    { date: '2023-03-12', price: 26914.10 },
    { date: '2023-03-19', price: 27475.60 },
    { date: '2023-03-26', price: 28456.10 },
    { date: '2023-04-02', price: 27941.20 },
    { date: '2023-04-09', price: 30299.60 },
    { date: '2023-04-16', price: 27813.90 },
    { date: '2023-04-23', price: 29234.10 },
    { date: '2023-04-30', price: 28857.10 },
    { date: '2023-05-07', price: 26777.50 },
    { date: '2023-05-14', price: 27116.20 },
    { date: '2023-05-21', price: 26857.50 },
    { date: '2023-05-28', price: 27072.00 },
    { date: '2023-06-04', price: 25844.00 },
    { date: '2023-06-11', price: 26515.00 },
    { date: '2023-06-18', price: 30533.60 },
    { date: '2023-06-25', price: 30586.80 },
    { date: '2023-07-02', price: 30288.80 },
    { date: '2023-07-09', price: 30291.40 },
    { date: '2023-07-16', price: 29788.90 },
    { date: '2023-07-23', price: 29353.50 },
    { date: '2023-07-30', price: 29068.10 },
    { date: '2023-08-06', price: 29428.20 },
    { date: '2023-08-13', price: 26099.40 },
    { date: '2023-08-20', price: 26017.10 },
    { date: '2023-08-27', price: 25869.70 },
    { date: '2023-09-03', price: 25901.10 },
    { date: '2023-09-10', price: 26562.00 },
    { date: '2023-09-17', price: 26579.20 },
    { date: '2023-09-24', price: 26962.70 },
    { date: '2023-10-01', price: 27961.10 },
    { date: '2023-10-08', price: 26852.80 },
    { date: '2023-10-15', price: 29912.90 },
    { date: '2023-10-22', price: 34082.60 },
    { date: '2023-10-29', price: 35065.80 },
    { date: '2023-11-05', price: 37150.50 },
    { date: '2023-11-12', price: 36568.60 },
    { date: '2023-11-19', price: 37787.00 },
    { date: '2023-11-26', price: 39458.40 },
    { date: '2023-12-03', price: 43718.40 },
    { date: '2023-12-10', price: 42271.70 },
    { date: '2023-12-17', price: 43710.40 },
    { date: '2023-12-24', price: 42136.70 },
    { date: '2023-12-31', price: 43967.90 },
    { date: '2024-01-07', price: 42851.30 },
    { date: '2024-01-14', price: 41695.40 },
    { date: '2024-01-21', price: 42120.90 },
    { date: '2024-01-28', price: 43005.70 },
    { date: '2024-02-04', price: 47758.20 },
    { date: '2024-02-11', price: 51646.00 },
    { date: '2024-02-18', price: 51571.60 },
    { date: '2024-02-25', price: 61994.50 },
    { date: '2024-03-03', price: 68366.50 },
    { date: '2024-03-10', price: 65314.20 },
    { date: '2024-03-17', price: 64037.80 },
    { date: '2024-03-24', price: 69611.50 },
    { date: '2024-03-31', price: 68890.60 },
    { date: '2024-04-07', price: 63849.90 },
    { date: '2024-04-14', price: 64961.10 },
    { date: '2024-04-21', price: 63456.80 },
    { date: '2024-04-28', price: 63888.30 },
    { date: '2024-05-05', price: 60826.60 },
    { date: '2024-05-12', price: 66917.50 },
    { date: '2024-05-19', price: 69284.40 },
    { date: '2024-05-26', price: 67760.80 },
    { date: '2024-06-02', price: 69310.10 },
    { date: '2024-06-09', price: 66223.00 },
    { date: '2024-06-16', price: 64261.00 },
    { date: '2024-06-23', price: 60973.40 },
    { date: '2024-06-30', price: 58259.20 },
    { date: '2024-07-07', price: 59209.80 },
    { date: '2024-07-14', price: 67148.50 },
    { date: '2024-07-21', price: 67843.10 },
    { date: '2024-07-28', price: 60696.70 },
    { date: '2024-08-04', price: 60931.70 },
    { date: '2024-08-11', price: 59483.10 },
    { date: '2024-08-18', price: 64159.30 },
    { date: '2024-08-25', price: 58978.60 },
    { date: '2024-09-01', price: 54156.50 },
    { date: '2024-09-08', price: 59995.40 },
    { date: '2024-09-15', price: 63348.10 },
    { date: '2024-09-22', price: 65866.50 },
    { date: '2024-09-29', price: 62061.40 },
    { date: '2024-10-06', price: 63205.10 },
    { date: '2024-10-13', price: 68372.00 },
    { date: '2024-10-20', price: 67086.80 },
    { date: '2024-10-27', price: 69325.80 },
    { date: '2024-11-03', price: 76700.30 },
    { date: '2024-11-10', price: 90539.10 },
    { date: '2024-11-17', price: 97699.00 },
    { date: '2024-11-24', price: 96405.70 },
    { date: '2024-12-01', price: 99837.00 },
    { date: '2024-12-08', price: 101417.70 },
    { date: '2024-12-15', price: 97253.30 },
    { date: '2024-12-22', price: 95284.50 },
    { date: '2024-12-29', price: 98219.90 },
    { date: '2025-01-05', price: 94596.70 },
    { date: '2025-01-12', price: 104536.90 },
    { date: '2025-01-19', price: 104742.90 },
    { date: '2025-01-26', price: 100648.00 },
    { date: '2025-02-02', price: 96447.90 },
    { date: '2025-02-09', price: 97573.40 },
    { date: '2025-02-16', price: 98462.70 }
];

// 決定係数（R²）の計算
const calculateRSquared = (actualPrices, predictedPrices) => {
    if (actualPrices.length !== predictedPrices.length || actualPrices.length === 0) {
        return NaN;
    }
    const n = actualPrices.length;
    const actualMean = actualPrices.reduce((sum, price) => sum + price, 0) / n;
    let sst = 0, sse = 0;
    for (let i = 0; i < n; i++) {
        sst += Math.pow(actualPrices[i] - actualMean, 2);
        sse += Math.pow(actualPrices[i] - predictedPrices[i], 2);
    }
    return 1 - (sse / sst) || 0; // NaNを0に変換
};

// モデル計算
const calculateDaysSinceGenesis = (dateStr) => {
    const date = new Date(dateStr);
    return Math.max(1, Math.floor((date - GENESIS_DATE) / (1000 * 60 * 60 * 24)));
};
const calculateMedianPrice = (days) => Math.pow(10, -17.01593313 + 5.84509376 * Math.log10(days));
const calculateSupportPrice = (days) => Math.pow(10, -17.668) * Math.pow(days, 5.926);

// カスタムツールチップ
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 shadow-lg">
            <p className="text-gray-200 font-bold mb-2 text-sm">{label}</p>
            {payload.map((entry, index) => (
                <p key={index} className="text-sm" style={{ color: entry.color }}>
                    {entry.name}: {Math.pow(10, entry.value).toLocaleString()} USD
                </p>
            ))}
        </div>
    );
};

// カスタム凡例
const CustomLegend = ({ payload }) => {
    if (!payload) return null;

    const labelMap = {
        price: '実価格',
        medianModel: '中央値',
        supportModel: '下限値'
    };

    return (
        <div className="flex flex-wrap gap-4 justify-center md:justify-end p-2 bg-gray-900">
            {payload.map((entry, index) => {
                const label = labelMap[entry.dataKey] || entry.dataKey;
                return (
                    <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-gray-200 text-sm">{label}</span>
                    </div>
                );
            })}
        </div>
    );
};

// カスタムツールチップ（TooltipIcon）を定義
const TooltipIcon = ({ content }) => {
    return (
        <div className="group relative inline-block ml-2">
            <HelpCircle className="h-4 w-4 text-gray-300 hover:text-gray-100 cursor-help transition-colors" />
            <div className="invisible group-hover:visible absolute z-20 w-64 p-2 mt-2 text-sm text-gray-200 bg-gray-900 rounded-lg shadow-lg">
                {content}
            </div>
        </div>
    );
};

// メインコンポーネント
const BTCPowerLawChart = () => {
    const chartData = useMemo(() => {
        const historicalData = WEEKLY_PRICES.map(item => ({
            date: item.date.substring(0, 7), // 年月のみ（YYYY-MM）に簡略化
            price: Math.log10(item.price), // 対数スケール
            medianModel: Math.log10(calculateMedianPrice(calculateDaysSinceGenesis(item.date))),
            supportModel: Math.log10(calculateSupportPrice(calculateDaysSinceGenesis(item.date)))
        }));

        // 未来データ（2040年まで、年月のみ）
        const futureData = [];
        if (WEEKLY_PRICES.length > 0) {
            const lastDate = new Date(WEEKLY_PRICES[WEEKLY_PRICES.length - 1].date);
            const endDate = new Date('2040-12-31');
            let currentDate = new Date(lastDate);

            while (currentDate <= endDate) {
                const dateStr = currentDate.toISOString().split('T')[0];
                const days = calculateDaysSinceGenesis(dateStr);
                futureData.push({
                    date: dateStr.substring(0, 7), // 年月のみ（YYYY-MM）
                    medianModel: Math.log10(calculateMedianPrice(days)),
                    supportModel: Math.log10(calculateSupportPrice(days))
                });
                currentDate.setDate(currentDate.getDate() + 7); // 1週間ずつ進める
            }
        }

        // 決定係数の計算
        const actualPrices = historicalData.map(item => item.price);
        const medianPrices = historicalData.map(item => item.medianModel);
        const rSquaredMedian = calculateRSquared(actualPrices, medianPrices);

        // 下限付近のデータでR²を計算（閾値0.2）
        const lowerBoundThreshold = 0.2;
        const lowerBoundData = historicalData.filter(item => Math.abs(item.price - item.supportModel) < lowerBoundThreshold);
        const lowerBoundActualPrices = lowerBoundData.map(item => item.price);
        const lowerBoundSupportPrices = lowerBoundData.map(item => item.supportModel);
        const rSquaredLowerBound = calculateRSquared(lowerBoundActualPrices, lowerBoundSupportPrices) || 0;

        return { data: [...historicalData, ...futureData], rSquaredMedian, rSquaredLowerBound };
    }, []);

    return (
        <div className="w-full bg-gray-900 p-6 rounded-xl shadow-xl">
            {/* タイトルと本文説明を削除 */}

            {/* 決定係数の表示（ツールチップのみ） */}
            <div className="flex flex-col md:flex-row gap-4 text-sm mb-4">
                <div className="bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
                    <span className="text-gray-400">中央値 R²:</span>
                    <span className="text-green-400 font-mono">{chartData.rSquaredMedian.toFixed(4)}</span>
                    <TooltipIcon content="決定係数（R²）は、モデルの予測が実際のデータにどれだけ一致しているかを示す指標です。値が1に近いほど、モデルが実価格に正確にフィットしていることを意味します。パワーローの中央値モデルは、全体のデータを用いて計算しています。" />
                </div>
                <div className="bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
                    <span className="text-gray-400">下限付近 R²:</span>
                    <span className="text-blue-400 font-mono">{chartData.rSquaredLowerBound.toFixed(4)}</span>
                    <TooltipIcon content="決定係数（R²）は、モデルの予測が実際のデータにどれだけ一致しているかを示す指標です。値が1に近いほど、モデルが実価格に正確にフィットしていることを意味します。パワーローの下限値モデルでは、下限付近（実価格が下限値に近い部分）のデータを用いて計算しています。この下限値の線は、ビットコイン価格の「サポートライン（支持線）」として機能し、価格が下落した際に支える役割を果たすとされています。" />
                </div>
            </div>

            <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.5} />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#9CA3AF', fontSize: 10 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis
                            tick={{ fill: '#9CA3AF', fontSize: 10 }}
                            domain={['auto', 'auto']} // 自動範囲調整
                            width={40} // Y軸の幅を狭く
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={<CustomLegend />} />
                        <Line
                            name="実価格"
                            type="monotone"
                            dataKey="price"
                            stroke={COLORS.price}
                            dot={false}
                            strokeWidth={2}
                        />
                        <Line
                            name="中央値"
                            type="monotone"
                            dataKey="medianModel"
                            stroke={COLORS.median}
                            dot={false}
                            strokeWidth={1.5}
                        />
                        <Line
                            name="下限値"
                            type="monotone"
                            dataKey="supportModel"
                            stroke={COLORS.support}
                            strokeDasharray="3 3"
                            dot={false}
                            strokeWidth={1.5}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default BTCPowerLawChart;