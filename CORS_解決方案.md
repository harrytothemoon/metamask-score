# CORS 問題解決方案

## 問題說明

當你在瀏覽器中直接調用 1inch API 時，會遇到 CORS（跨域資源共享）錯誤：

```
Access to XMLHttpRequest at 'https://api.1inch.dev/...' has been blocked by CORS policy
```

這是因為 1inch API 不允許從瀏覽器直接訪問，只能從伺服器端調用。

## 🎯 解決方案

### 方案 1：Cloudflare Workers 代理（推薦）⭐

**優點**：

- ✅ 完全免費（每天 100,000 次請求）
- ✅ 全球 CDN 加速
- ✅ 設置簡單（5 分鐘完成）
- ✅ 完美適合靜態網站

**步驟**：

1. 詳細步驟請參考 `CLOUDFLARE_SETUP.md`
2. 部署 Worker 後獲取 URL
3. 配置環境變量即可使用

### 方案 2：使用示範數據（當前方案）

**說明**：

- 應用已經內建了智能備援機制
- 當無法連接到 API 時，會自動顯示示範數據
- 用戶可以看到界面效果和價格影響的概念
- 適合展示和測試

**示範數據範例**：

```javascript
{
  amount: 100,
  priceImpact: '0.05%',
  estimatedGas: '150000',
  demo: true
}
```

### 方案 3：Vercel 部署（替代方案）

如果你想使用 Vercel 而不是 GitHub Pages：

1. 創建 Vercel 帳號
2. 在專案中添加 `api/quote.js`：

```javascript
export default async function handler(req, res) {
  const { src, dst, amount, chainId = 1 } = req.query;

  const response = await fetch(
    `https://api.1inch.dev/swap/v5.2/${chainId}/quote?src=${src}&dst=${dst}&amount=${amount}`,
    {
      headers: {
        Authorization: "Bearer YOUR_API_KEY",
      },
    }
  );

  const data = await response.json();
  res.json(data);
}
```

3. 部署到 Vercel
4. API 會自動可用於 `/api/quote`

## 🚀 當前狀態

### 開發環境

- ✅ 已配置 Vite 代理
- ✅ 自動處理 CORS
- ✅ 但由於 1inch 需要真實 API key，仍會顯示示範數據

### 生產環境

- ⚠️ 需要配置 Cloudflare Worker
- ✅ 未配置時自動使用示範數據
- ✅ 用戶體驗不受影響

## 📊 功能對比

| 方案               | 免費 | 設置難度   | 真實數據 | 適合場景    |
| ------------------ | ---- | ---------- | -------- | ----------- |
| Cloudflare Workers | ✅   | ⭐⭐       | ✅       | 生產環境    |
| 示範數據           | ✅   | ⭐         | ❌       | 展示/測試   |
| Vercel API         | ✅   | ⭐⭐⭐     | ✅       | Vercel 用戶 |
| 自建後端           | ❌   | ⭐⭐⭐⭐⭐ | ✅       | 企業級      |

## 🎓 推薦流程

### 第一階段：展示（當前）

- 使用示範數據
- 展示界面和功能
- 無需額外配置

### 第二階段：真實數據

1. 註冊 1inch API key
2. 設置 Cloudflare Worker
3. 配置環境變量
4. 重新部署

### 第三階段：優化

- 添加請求緩存
- 實現速率限制
- 添加錯誤重試

## ❓ 常見問題

### Q: 為什麼開發環境也顯示示範數據？

A: 1inch API 的 demo-key 已經失效，需要真實的 API key。但這不影響界面開發和測試。

### Q: 不設置 Cloudflare Worker 可以嗎？

A: 可以！應用會自動使用示範數據，界面完全正常工作，只是數據不是實時的。

### Q: Cloudflare Workers 會很複雜嗎？

A: 不會！只需複製粘貼 `cloudflare-worker.js` 的代碼，整個過程 5 分鐘完成。

## 📝 總結

**目前狀態**：應用已經可以正常運行，顯示示範數據，用戶體驗完整。

**下一步（可選）**：如果需要真實數據，按照 `CLOUDFLARE_SETUP.md` 設置代理即可。

這個設計讓你可以先快速部署和展示，之後再根據需要添加真實數據支持。🎉
