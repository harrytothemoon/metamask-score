## 為什麼需要代理？

1inch API 不允許從瀏覽器直接調用（CORS 限制），所以我們需要創建一個代理服務器。
Cloudflare Workers 是免費且快速的解決方案，非常適合靜態網站。

## 設置步驟

### 1. 註冊 Cloudflare 帳號

1. 前往 [Cloudflare](https://dash.cloudflare.com/sign-up)
2. 註冊一個免費帳號

### 2. 創建 Worker

1. 登入 Cloudflare Dashboard
2. 在左側菜單選擇 **Workers & Pages**
3. 點擊 **Create application**
4. 選擇 **Create Worker**
5. 給 Worker 命名，例如：`metamask-score-proxy`
6. 點擊 **Deploy**

### 3. 獲取 1inch API Key

1. 前往 [1inch Developer Portal](https://portal.1inch.dev/)
2. 註冊並創建 API key
3. 複製你的 API key（稍後需要使用）

### 4. 編輯 Worker 代碼

1. 在 Worker 頁面點擊 **Quick edit**
2. 刪除默認代碼
3. 複製 `cloudflare-worker.js` 中的代碼並貼上
4. 點擊 **Save and deploy**

### 5. 配置 API Key（使用 Secret）⚠️ 重要

**不要把 API key 直接寫在代碼裡！** 使用 Cloudflare Workers Secrets：

1. 在 Worker 頁面，點擊 **Settings** 標籤
2. 找到 **Variables and Secrets** 區塊
3. 在 **Environment Variables** 下點擊 **Add variable**
4. 點擊 **Encrypt** 按鈕（切換到 Secret 模式）
5. 設置：
   - **Variable name**: `ONEINCH_API_KEY`
   - **Value**: 貼上你的 1inch API key
6. 點擊 **Save and deploy**

這樣 API key 會被加密存儲，不會出現在代碼中！

### 6. 測試 Worker

1. 在 Worker 頁面可以看到你的 Worker URL：
   ```
   https://metamask-score-proxy.YOUR_USERNAME.workers.dev
   ```

2. 測試 API（在瀏覽器或 Postman 中）：
   ```
   https://your-worker.workers.dev?src=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&dst=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&amount=100000000000000000000&chainId=1
   ```

3. 應該會返回 1inch API 的報價數據

### 7. 更新前端代碼

編輯 `src/components/PriceImpactCalculator.jsx`，找到 `fetchQuote` 函數：

```javascript
const fetchQuote = async (amount) => {
  try {
    const chainId = 1; // Ethereum mainnet
    const amountInWei = (amount * 1e18).toString();

    // 使用你的 Cloudflare Worker URL
    const url = "https://metamask-score-proxy.YOUR_USERNAME.workers.dev";
    const params = {
      src: tokenFrom,
      dst: tokenTo,
      amount: amountInWei,
      chainId: chainId,
    };

    const response = await axios.get(url, { params });
    return response.data;
  } catch (err) {
    console.error(`Error fetching quote for $${amount}:`, err);
    throw err;
  }
};
```

## 免費額度

Cloudflare Workers 免費方案包括：

- 每天 100,000 次請求
- 全球 CDN 加速
- 完全夠用於個人項目

## 測試

1. 更新代碼後重新構建：`yarn build`
2. 本地測試：`yarn dev`
3. 嘗試查詢價格影響
4. 應該不再看到 CORS 錯誤

## 疑難排解

### Worker 返回錯誤

檢查：

1. API key 是否正確配置
2. Worker 代碼是否正確部署
3. 查看 Worker 的 Logs 標籤頁

### 仍然有 CORS 錯誤

確認：

1. Worker URL 是否正確
2. Worker 是否成功部署
3. 前端代碼是否更新

## 替代方案：使用開發代理

如果只想在本地測試，可以使用 Vite 的代理功能（見 `vite.config.js`）。
但這只適用於開發環境，生產環境仍需要 Cloudflare Workers。
