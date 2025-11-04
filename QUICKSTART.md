# 快速開始指南

## 本地開發

### 1. 安裝依賴

```bash
# 確保使用 Node.js 18 或更高版本
node --version  # 應該顯示 v18.x.x 或更高

# 如果使用 fnm，切換到 Node 20
fnm use 20

# 設置 yarn registry
yarn config set registry https://registry.npmjs.org

# 安裝依賴
yarn install
```

### 2. 啟動開發伺服器

```bash
yarn dev
```

打開瀏覽器訪問 `http://localhost:5173`

### 3. 構建生產版本

```bash
yarn build
```

構建後的文件將在 `dist` 目錄中。

### 4. 預覽生產構建

```bash
yarn preview
```

打開瀏覽器訪問 `http://localhost:4173`

## 部署到 GitHub Pages

### 選項 1：使用 GitHub Actions（推薦）

1. 在 GitHub 創建新倉庫
2. 推送代碼：
   ```bash
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/metamask-score.git
   git push -u origin main
   ```
3. GitHub Actions 會自動構建和部署
4. 在 GitHub Settings > Pages 中設置 Source 為 `gh-pages` 分支
5. 訪問 `https://YOUR_USERNAME.github.io/metamask-score/`

### 選項 2：手動部署

```bash
yarn deploy
```

## 主要功能

### 支援的代幣

- ETH (Ethereum)
- USDC (USD Coin)
- USDT (Tether)
- DAI (Dai Stablecoin)
- WBTC (Wrapped Bitcoin)
- UNI (Uniswap)

### 價格影響級別

| 影響範圍 | 顏色 | 建議 |
|---------|------|------|
| < 0.1% | 綠色 | 適合交易 |
| 0.1% - 1% | 黃色 | 可接受 |
| 1% - 3% | 橙色 | 需謹慎 |
| > 3% | 紅色 | 不建議 |

### 測試金額

系統會自動查詢以下金額的價格影響：
- $100 USD
- $1,000 USD
- $10,000 USD

## 配置 API Key

要獲取真實數據，需要配置 1inch API key：

1. 訪問 https://portal.1inch.dev/
2. 註冊並獲取 API key
3. 編輯 `src/components/PriceImpactCalculator.jsx`：

```javascript
// 找到這一行
'Authorization': 'Bearer demo-key',

// 替換為
'Authorization': 'Bearer YOUR_ACTUAL_API_KEY',
```

## 專案結構

```
metamask-score/
├── .github/workflows/     # GitHub Actions 配置
├── public/               # 靜態資源
├── src/
│   ├── components/       # React 組件
│   │   └── PriceImpactCalculator.jsx
│   ├── App.jsx          # 主應用
│   ├── main.jsx         # 入口文件
│   └── index.css        # 全局樣式
├── index.html           # HTML 模板
├── vite.config.js       # Vite 配置
├── tailwind.config.js   # Tailwind 配置
└── package.json         # 專案配置
```

## 常見問題

### Q: 為什麼顯示"示範數據"？

A: 這是因為沒有配置有效的 1inch API key，或者 API 請求失敗。系統會自動切換到示範模式。

### Q: 如何添加更多代幣？

A: 編輯 `src/components/PriceImpactCalculator.jsx` 中的 `popularTokens` 數組：

```javascript
const popularTokens = [
  { symbol: 'TOKEN_SYMBOL', address: '0x...', decimals: 18 },
  // 添加更多...
];
```

### Q: 如何更改測試金額？

A: 在 `handleCalculate` 函數中修改 `amounts` 數組：

```javascript
const amounts = [100, 1000, 10000]; // 修改這些值
```

### Q: 如何自訂主題顏色？

A: 修改 `tailwind.config.js` 或 `src/index.css` 中的樣式。

## 技術支持

如有問題，請：
1. 查看 `README.md` 了解詳細信息
2. 查看 `DEPLOYMENT.md` 了解部署問題
3. 在 GitHub Issues 提交問題

## 授權

MIT License - 自由使用和修改

