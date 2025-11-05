# Linea 鏈 DEX 價格影響查詢工具

這是一個基於 React + TailwindCSS 的靜態網頁應用，專門用於查詢 **Linea 鏈**上的加密貨幣交易對價格影響。

## 🌟 功能特點

- 🔗 **Linea 鏈專用**：專注於 Linea 生態系統
- 🔍 查詢 ETH/USDT/USDC 交易對在不同金額（$300/$1000/$5000）下的價格影響
- 📊 **真實價格影響**：基於 USD 價格計算，準確反映交易成本
- 🦊 **與 MetaMask 一致**：使用 KyberSwap 聚合器（MetaMask Swaps 的數據來源之一）
- 🎨 現代化的 UI 設計
- 📱 響應式設計，支援各種設備
- ⚡ **性能優化**：單次查詢，約 6 秒獲取所有數據

## 🛠 技術棧

- **前端框架**: React 18
- **構建工具**: Vite
- **樣式**: TailwindCSS
- **區塊鏈**: Linea (Layer 2)
- **DEX 聚合器**: KyberSwap Aggregator API
- **代理服務**: Cloudflare Workers
- **包管理器**: Yarn
- **部署**: GitHub Pages

## 🎯 支持的交易對

在 Linea 鏈上查詢以下交易對：

- ETH → USDC
- ETH → USDT
- USDC → USDT
- USDT → USDC
- USDC → ETH
- USDT → ETH

## 🚀 快速開始

### 前置需求

- Node.js 20+（推薦使用 fnm 或 nvm）
- Yarn 1.22+

### 安裝依賴

```bash
# 設置 npm registry
yarn config set registry https://registry.npmjs.org

# 安裝依賴
yarn install
```

### 啟動開發伺服器

```bash
yarn dev
```

應用將在 `http://localhost:5173` 啟動

### 構建生產版本

```bash
yarn build
```

### 預覽生產構建

```bash
yarn preview
```

## 部署到 GitHub Pages

### 自動部署

本專案已配置 GitHub Actions，當推送到 `main` 分支時會自動構建並部署到 GitHub Pages。

### 手動部署

```bash
yarn deploy
```

### 配置步驟

1. 在 GitHub 倉庫中啟用 GitHub Pages
2. 設定 Source 為 `gh-pages` 分支
3. 推送代碼到 `main` 分支，GitHub Actions 會自動部署

## 🔧 API 配置

本應用使用 **KyberSwap Aggregator API** 來獲取 Linea 鏈上的實時報價。

### ✅ 為什麼選擇 KyberSwap？

- **官方支持 Linea 鏈**：原生支持，數據準確
- **無需 API Key**：開箱即用，無需註冊
- **與 MetaMask 一致**：MetaMask Swaps 的數據來源之一
- **真實價格影響**：基於 USD 價格計算，考慮實際交易成本
- **聚合多個 DEX**：自動尋找最優路由

### 🌐 Cloudflare Worker 設置

雖然 KyberSwap API 不需要 API key，但為了繞過 CORS 限制，我們使用 Cloudflare Worker 作為代理。

**設置步驟**：

1. 登錄 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 創建新的 Worker
3. 複製 `cloudflare-worker.js` 的內容
4. 部署 Worker
5. 更新前端代碼中的 `proxyUrl`

詳細說明請參考：
- 📚 `CLOUDFLARE_SETUP.md` - Worker 設置指南
- 📖 `LINEA_API_OPTIONS.md` - Linea API 選擇方案分析

## 📈 價格影響說明

價格影響 = (投入 USD 金額 - 實際得到 USD 金額) / 投入 USD 金額 × 100

### 顏色編碼

- **負數** (深綠色): 價格變好！大額買入更划算（可能的套利機會）
- **< 0.1%** (綠色): 影響很小，流動性極佳，適合交易
- **0.1% - 1%** (黃色): 影響輕微，流動性良好，可接受
- **1% - 3%** (橙色): 影響較大，需謹慎考慮
- **> 3%** (紅色): 影響顯著，流動性不足，不建議大額交易

### 示例

如果你用 $1000 買 ETH：
- 價格影響 **-0.5%** = 你實際得到價值 **$1005** 的 ETH ✅（划算！）
- 價格影響 **+0.5%** = 你實際得到價值 **$995** 的 ETH ⚠️（有滑點）

## 專案結構

```
metamask-score/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions 部署配置
├── src/
│   ├── components/
│   │   └── PriceImpactCalculator.jsx  # 價格影響計算器組件
│   ├── App.jsx             # 主應用組件
│   ├── main.jsx            # 應用入口
│   └── index.css           # 全局樣式
├── index.html              # HTML 模板
├── vite.config.js          # Vite 配置
├── tailwind.config.js      # TailwindCSS 配置
├── postcss.config.js       # PostCSS 配置
└── package.json            # 專案依賴
```

## ⚠️ 注意事項

- 本工具僅供參考，實際交易價格可能因市場情況而有所不同
- 建議在進行大額交易前，使用多個來源驗證價格影響
- KyberSwap API 有速率限制，請勿過度頻繁調用
- **Linea 專用**：本工具只查詢 Linea 鏈上的交易對

## 🔄 與 Ethereum 主網版本的區別

| 特性 | Linea 版本 (當前) | Ethereum 版本 (舊版) |
|------|-------------------|---------------------|
| **區塊鏈** | Linea (Layer 2) | Ethereum Mainnet |
| **API** | KyberSwap | 1inch |
| **API Key** | ❌ 不需要 | ✅ 需要 |
| **支持代幣** | ETH, USDT, USDC | ETH, USDT, USDC, DAI, WBTC |
| **查詢速度** | ~6 秒 (單次) | ~12 秒 (雙重查詢) |
| **價格影響計算** | 基於真實 USD 價格 | 基於雙重查詢比較 |
| **Gas 費用** | 極低 | 高 |

## 📚 相關文檔

- 📖 `LINEA_API_OPTIONS.md` - 為什麼選擇 KyberSwap？詳細分析
- 🚀 `QUICKSTART.md` - 快速開始指南
- 📋 `PROJECT_SUMMARY.md` - 項目完整總結
- 🛠 `CLOUDFLARE_SETUP.md` - Worker 設置詳解

## 授權

MIT License

## 聯繫方式

如有問題或建議，歡迎提交 Issue 或 Pull Request。

