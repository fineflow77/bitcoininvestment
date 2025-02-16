/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}", // Reactプロジェクト用
    "./public/index.html", // HTMLファイルがある場合
  ],
  theme: {
    extend: {}, // カスタマイズがあればここに書く
  },
  plugins: [],
};