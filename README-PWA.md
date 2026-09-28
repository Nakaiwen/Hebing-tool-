# Hebing-tool PWA 補件（2026-09-28）

## 放哪裡
把這四個檔放進 Hebing-tool 的根目錄（和 index.html 同一層），再推上 GitHub：

| 檔案 | 說明 |
|---|---|
| `index.html` | 覆蓋舊檔。只多了 `<head>` 八行（manifest、主題色、圖示）與文末的 SW 註冊；其餘與線上版逐字相同 |
| `manifest.webmanifest` | 新檔。App 名稱「小六合盤」、獨立視窗、紙色主題 `#f7f1e4`、三個圖示 |
| `sw.js` | 新檔。離線快取 |
| `test-pwa.js` | 新檔。PWA 測試：`node test-pwa.js` |

`icons/` 四張圖已在 GitHub 上，不用再傳。

## 快取策略
- **預先快取 36 個檔、共 4.4 MB**：四個子頁、太乙國運頁、奇門、程式、樣式、圖示。
- **標楷體（每份 36.8 MB）不預先下載**：第一次開太乙時才存，之後永遠讀本機、不背景重抓；升版也保留。
- **網頁**：網路優先，推新版後使用者一連網就是新版；離線讀快取。
- **程式／樣式／CDN（chart.js、marked、html2canvas、jsPDF）**：先回快取，背景更新。

## ★ 每次發布新版
把 `sw.js` 第一行的 `VERSION` 加一（例：`hebing-v0.9.37-pwa1` → `pwa2`）。新增頁面或檔案時，記得加進 `CORE_ASSETS`，並跑 `node test-pwa.js` 確認全部存在——清單裡只要一個檔 404，整個 PWA 會安裝失敗。

## 驗證（2026-09-28）
- `test-pwa.js` 24 項 ALL PASS（含突變測試：故意塞缺檔會被抓到）
- 既有 `test-children.js` 129 項、`test-parent.js` 209 項 ALL PASS

## 手機上怎麼裝
- iPhone（Safari）：分享 →「加入主畫面」
- Android（Chrome）：選單 →「安裝應用程式」
第一次開啟請連網；之後離線也能打開排盤。
