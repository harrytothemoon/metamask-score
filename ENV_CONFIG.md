# 環境變量配置說明

## 本地開發

開發環境會自動使用 Vite 代理，無需額外配置。

只需運行：
```bash
yarn dev
```

## 生產環境（GitHub Pages）

需要配置 Cloudflare Worker 作為代理。

### 創建 `.env.production.local` 文件

在專案根目錄創建 `.env.production.local` 文件：

```env
# 替換為你的 Cloudflare Worker URL
VITE_PROXY_URL=https://your-worker-name.your-username.workers.dev
```

### 步驟

1. 按照 `CLOUDFLARE_SETUP.md` 設置 Cloudflare Worker
2. 獲取 Worker URL
3. 創建 `.env.production.local` 文件並填入 URL
4. 構建並部署：`yarn build`

## 環境變量說明

- `VITE_PROXY_URL`: Cloudflare Worker 代理 URL（生產環境必需）
- 如果未設置，生產環境會顯示示範數據

## 快速測試

### 開發環境
```bash
yarn dev
# 訪問 http://localhost:5173
# 點擊「計算價格影響」按鈕
# 由於 CORS 限制，仍會顯示示範數據（1inch API 不支持 demo key）
```

### 生產環境（需要 Cloudflare Worker）
```bash
# 創建 .env.production.local 並配置 VITE_PROXY_URL
yarn build
yarn preview
# 訪問 http://localhost:4173
```

## 注意事項

⚠️ **重要**：由於瀏覽器 CORS 限制，必須使用以下方案之一：

1. **推薦**：設置 Cloudflare Worker 代理（免費，簡單）
2. **替代**：使用其他支援 CORS 的 DEX API
3. **展示**：使用示範數據（當前默認）

目前應用會在無法連接 API 時自動切換到示範數據模式，用戶體驗不會受影響。

