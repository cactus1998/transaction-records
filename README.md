# 樂咖大物輪 後台網站

![Static Badge](https://img.shields.io/badge/Vue3%20js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D) ![Static Badge](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![Static Badge](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![Static Badge](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E) ![Static Badge](https://img.shields.io/badge/Webpack-8DD6F9?style=for-the-badge&logo=Webpack&logoColor=white) ![Static Badge](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white) ![Static Badge](https://img.shields.io/badge/Node%20js%2014.16.0-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

![Static Badge](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![Static Badge](https://img.shields.io/badge/Element--Plus-409EFF?style=for-the-badge&logo=element&logoColor=white) ![Static Badge](https://img.shields.io/badge/Pinia-FFD859?style=for-the-badge&logo=pinia&logoColor=white) ![Static Badge](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white) ![Static Badge](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black) ![Static Badge](https://img.shields.io/badge/SweetAlert2-3085d6?style=for-the-badge&logoColor=white)

---

## 說明

一個以 **Vue 3 + Vite** 建置的後台管理專案範例，整合 Element Plus、TailwindCSS、Pinia 及 Firebase Firestore，提供：

- 登入/註冊功能（使用自訂帳號/密碼，密碼加密存於 Firestore）  
- Dashboard 頁面，展示投資績效表格（performance collection）  
- 可在 Dashboard 內寫入測試用假資料  
- 以 Tailwind + Element Plus 建立響應式 UI  

專案方便作為後台管理系統、數據展示或投資筆記類專案範本。

---

## 專案技術

- Vue v3.5.18  
- Vite v7.1.2  
- Element Plus ^2.11.1  
- Pinia ^3.0.3  
- TailwindCSS 3.4.17  
- Firebase ^12.2.1 (Firestore)  
- SweetAlert2 ^11.22.5  
- Vue Router ^4.5.1  
- Node.js 14.16.0 建議版本  
- 開發工具：@vitejs/plugin-vue, eslint, prettier, postcss, autoprefixer

---

## 資料夾說明

- `components` - 共用元件（表單、按鈕、圖表等）  
- `views` - 頁面（Login、Dashboard）  
- `store` - Pinia 狀態管理  
- `router` - Vue Router 設定  
- `assets` - 靜態資源 (圖片、字體、icons)  
- `modules` - 自訂功能模組或工具函式  

---

