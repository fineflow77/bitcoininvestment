/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'btc-navy': '#1A1F2E',     // 基本背景色（ダークネイビー）
        'btc-dark': '#111827',     // より濃い背景（ヘッダー、フッター用）
        'btc-surface': '#242937',  // カード、フォーム背景
        'btc-price': '#FF9500',    // ビットコイン色（オレンジ）
        'btc-median': '#3DDC84',   // 中央価格（緑）
        'btc-support': '#FF2D55',  // 下限価格（赤）
        'btc-text': '#E2E8F0',     // 基本テキスト色
        'btc-text-soft': '#94A3B8', // 薄めのテキスト
        'btc-highlight': '#3B82F6', // ハイライト色（青）
        'btc-accent': '#FF9500',   // アクセント色（ビットコインオレンジと同じ）
      },
    },
  },
  plugins: [],
}