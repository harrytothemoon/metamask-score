# Linea 鏈版本部署指南

## 🎯 當前狀態

✅ 已完成：
- [x] 切換到 Linea 鏈（chainId: 59144）
- [x] 集成 KyberSwap Aggregator API
- [x] 更新代幣地址（WETH, USDC, USDT on Linea）
- [x] 重寫 Cloudflare Worker
- [x] 優化前端代碼
- [x] 構建成功
- [x] 推送到 GitHub

⏳ 等待中：
- [ ] GitHub Actions 自動部署
- [ ] 更新 Cloudflare Worker 代碼

---

## 🚀 部署步驟

### 1. GitHub Pages 部署（自動）

代碼已推送到 GitHub，Actions 正在自動構建和部署。

**查看部署狀態**：
- 訪問：https://github.com/harrytothemoon/metamask-score/actions
- 等待 "pages build and deployment" 完成（約 1-2 分鐘）

### 2. 更新 Cloudflare Worker ⚠️ **必須操作**

由於我們從 1inch API 切換到了 KyberSwap API，**必須**更新 Cloudflare Worker。

#### 步驟：

1. **登錄 Cloudflare Dashboard**
   ```
   https://dash.cloudflare.com/
   ```

2. **找到你的 Worker**
   - Workers & Pages → 找到 `metamask-score-proxy`

3. **編輯 Worker 代碼**
   - 點擊 "Edit Code"
   - 刪除所有現有代碼
   - 複製 `cloudflare-worker.js` 的完整內容
   - 粘貼到編輯器

4. **關鍵改動預覽**

   **舊代碼（1inch）**：
   ```javascript
   const apiUrl = new URL(`https://api.1inch.dev/swap/v5.2/${chainId}/quote`);
   apiUrl.searchParams.append('src', src);
   apiUrl.searchParams.append('dst', dst);
   
   const response = await fetch(apiUrl.toString(), {
     headers: {
       Authorization: `Bearer ${apiKey}`,
     },
   });
   ```

   **新代碼（KyberSwap）**：
   ```javascript
   const kyberswapUrl = new URL(
     "https://aggregator-api.kyberswap.com/linea/api/v1/routes"
   );
   kyberswapUrl.searchParams.append("tokenIn", tokenIn);
   kyberswapUrl.searchParams.append("tokenOut", tokenOut);
   kyberswapUrl.searchParams.append("amountIn", amountIn);
   
   // 無需 API Key！
   const response = await fetch(kyberswapUrl.toString());
   ```

5. **刪除舊的 Secret（可選）**
   - Settings → Variables and Secrets
   - 刪除 `ONEINCH_API_KEY`（已不再需要）

6. **保存並部署**
   - 點擊 "Save and Deploy"

7. **測試 Worker**
   ```bash
   # 測試 ETH → USDC
   curl "https://metamask-score-proxy.harry811016.workers.dev/?tokenIn=0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f&tokenOut=0x176211869cA2b568f2A7D4EE941E073a821EE1ff&amountIn=1000000000000000000"
   ```

   **預期返回**：
   ```json
   {
     "toAmount": "3283561534",
     "fromAmount": "1000000000000000000",
     "priceImpact": 0.119,
     "estimatedPriceImpact": 0.119,
     "gas": "568831",
     ...
   }
   ```

---

## 🧪 測試部署

### 1. 訪問網站

等待 GitHub Actions 完成後，訪問：
```
https://harrytothemoon.github.io/metamask-score/
```

### 2. 功能測試

**應該看到**：
- ✅ 標題：「Linea 鏈 DEX 價格影響排名」
- ✅ 副標題：「數據來源：KyberSwap 聚合器」
- ✅ 金額選項：$300 / $1000 / $5000
- ✅ 6 個交易對（ETH ↔ USDC/USDT, USDC ↔ USDT）

**操作測試**：
1. 選擇金額（例如 $1000）
2. 點擊「查詢所有交易對」
3. 等待約 6 秒
4. 查看結果

**預期結果**：
```
排名  交易對          價格影響      價格
#1   USDC → USDT    0.05%     0.99921234
#2   USDT → USDC    0.08%     1.00012345
#3   ETH → USDC     0.12%     3285.56
...
```

### 3. 調試模式

打開瀏覽器開發者工具（F12），查看 Console：

**應該看到**：
```
開始查詢 Linea 鏈上的交易對數據（KyberSwap）...
查詢 ETH→USDC ($1000)...
ETH→USDC: 價格=3285.56789012, 影響=0.12% (投入=$1000, 得到=$998.80)
...
✅ 成功獲取 6 個交易對的價格影響數據 (Linea 鏈)
```

---

## 🐛 常見問題

### 問題 1：顯示「無法獲取任何交易對數據」

**原因**：Cloudflare Worker 尚未更新

**解決**：
1. 確認 Worker 代碼已更新為新版本
2. 檢查 Worker URL 是否正確
3. 測試 Worker 是否能正常返回數據

### 問題 2：價格影響仍然是 0%

**原因**：Worker 未正確計算價格影響

**解決**：
1. 檢查 Worker 代碼中的計算邏輯：
   ```javascript
   const priceImpact = ((amountInUsd - amountOutUsd) / amountInUsd) * 100;
   ```
2. 查看 Worker logs（Cloudflare Dashboard → Worker → Logs）

### 問題 3：CORS 錯誤

**原因**：Worker 的 CORS 頭設置錯誤

**解決**：
確保 Worker 返回中包含：
```javascript
headers: {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
}
```

### 問題 4：KyberSwap API 返回錯誤

**可能的錯誤**：
- `No route found` - 該交易對流動性不足
- `Invalid token address` - 代幣地址錯誤

**解決**：
1. 確認使用的是 Linea 鏈的代幣地址
2. 檢查金額是否過大或過小

---

## 📊 監控和維護

### 性能指標

- **查詢時間**：每個交易對約 1 秒
- **總查詢時間**：6 個交易對約 6 秒
- **緩存時間**：30 秒（Worker 設置）

### API 速率限制

KyberSwap API：
- **免費版**：約 100 次/分鐘
- **建議**：添加本地緩存，避免重複查詢

### Worker 監控

在 Cloudflare Dashboard 查看：
- **請求數量**
- **錯誤率**
- **平均響應時間**
- **使用流量**

---

## 🎉 部署完成檢查清單

- [ ] GitHub Actions 部署成功
- [ ] Cloudflare Worker 已更新
- [ ] 網站可以正常訪問
- [ ] 價格影響數據正確顯示（非 0%）
- [ ] 所有 6 個交易對都能查詢
- [ ] Console 無錯誤
- [ ] 價格影響排序正確
- [ ] 加載時間合理（< 10 秒）

---

## 📞 需要幫助？

如果遇到問題：

1. **檢查 Console**：查看錯誤信息
2. **檢查 Network**：查看 API 請求和響應
3. **檢查 Worker Logs**：Cloudflare Dashboard
4. **參考文檔**：
   - `LINEA_API_OPTIONS.md` - API 選擇方案
   - `cloudflare-worker.js` - Worker 完整代碼
   - `src/components/PriceImpactCalculator.jsx` - 前端邏輯

---

**部署時間**: 2025-11-05
**版本**: Linea + KyberSwap v1.0.0
**下一步**: 等待 GitHub Actions 完成，然後更新 Cloudflare Worker 🚀

