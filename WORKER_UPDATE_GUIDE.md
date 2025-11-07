# Cloudflare Worker 更新指南

## 🔴 當前問題

你的 Worker 返回了 HTML 錯誤：
```
<!DOCTYPE ... is not valid JSON
```

這意味著 Worker 代碼還沒有正確更新。

---

## ✅ 解決方案：立即更新 Worker

### 步驟 1：登錄 Cloudflare

訪問：https://dash.cloudflare.com/

### 步驟 2：找到你的 Worker

1. 左側菜單：**Workers & Pages**
2. 找到：`metamask-score-proxy`
3. 點擊進入

### 步驟 3：更新代碼

#### 選項 A：使用簡化版（推薦測試）

1. 點擊 **"Edit Code"** 或 **"Quick Edit"**
2. **刪除所有現有代碼**
3. 複製 `cloudflare-worker-simple.js` 的**完整內容**
4. 粘貼到編輯器
5. 點擊 **"Save and Deploy"**

#### 選項 B：使用完整版

1. 點擊 **"Edit Code"**
2. **刪除所有現有代碼**
3. 複製 `cloudflare-worker.js` 的**完整內容**
4. 粘貼到編輯器
5. 點擊 **"Save and Deploy"**

### 步驟 4：驗證部署

等待 5-10 秒，然後測試：

```bash
curl "https://metamask-score-proxy.harry811016.workers.dev/?tokenIn=0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f&tokenOut=0x176211869cA2b568f2A7D4EE941E073a821EE1ff&amountIn=1000000000000000000"
```

**應該返回類似**：
```json
{
  "toAmount": "3339453649",
  "fromAmount": "1000000000000000000",
  "priceImpact": 0.089,
  "estimatedPriceImpact": 0.089,
  "gas": "1146563",
  ...
}
```

---

## 🎯 關於 KyberSwap API Key

### ✅ 不需要 API Key！

KyberSwap Aggregator API 是**免費開放的**：

- ✅ 無需註冊
- ✅ 無需 API Key
- ✅ 直接調用即可

### 📊 速率限制

從 API 返回頭看到：
```
x-tier: basic
x-ratelimit-limit: 30, 10
x-ratelimit-remaining: 29
x-ratelimit-reset-after: 10
```

**含義**：
- **Basic 層級**：免費用戶
- **速率限制**：30 次請求 / 10 秒
- **剩餘次數**：29 次
- **重置時間**：10 秒後

### 💡 與 1inch 的區別

| 特性 | 1inch API | KyberSwap API |
|------|-----------|---------------|
| **API Key** | ✅ 必須 | ❌ 不需要 |
| **註冊** | ✅ 需要 | ❌ 不需要 |
| **免費額度** | 有限 | 有限 |
| **速率限制** | 依層級 | 30/10秒 |
| **Linea 支持** | ❌ 不支持 | ✅ 支持 |

---

## 🧪 測試步驟

### 1. 測試 Worker（必須先更新代碼）

```bash
# 基本測試
curl "https://metamask-score-proxy.harry811016.workers.dev/?tokenIn=0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f&tokenOut=0x176211869cA2b568f2A7D4EE941E073a821EE1ff&amountIn=1000000000000000000"
```

### 2. 測試不同交易對

```bash
# USDC → USDT
curl "https://metamask-score-proxy.harry811016.workers.dev/?tokenIn=0x176211869cA2b568f2A7D4EE941E073a821EE1ff&tokenOut=0xA219439258ca9da29E9Cc4cE5596924745e12B93&amountIn=1000000000"
```

### 3. 查看 Worker Logs

在 Cloudflare Dashboard：
1. 進入你的 Worker
2. 點擊 **"Logs"** 或 **"Real-time Logs"**
3. 查看實時日誌輸出

---

## ❌ 如果還是不行

### 檢查清單

- [ ] Worker 代碼是否完全替換（不是追加）
- [ ] 是否點擊了 "Save and Deploy"
- [ ] 等待了 5-10 秒讓部署生效
- [ ] Worker URL 是否正確
- [ ] 參數格式是否正確（tokenIn, tokenOut, amountIn）

### 調試步驟

1. **查看 Worker Logs**
   - 應該看到 "Calling KyberSwap: ..."
   - 應該看到 "KyberSwap status: 200"
   - 應該看到 "Price impact: X.XX%"

2. **測試簡化版**
   - 先用 `cloudflare-worker-simple.js`
   - 這個版本有更詳細的錯誤信息

3. **手動測試 KyberSwap**
   ```bash
   # 直接調用 KyberSwap（應該成功）
   curl "https://aggregator-api.kyberswap.com/linea/api/v1/routes?tokenIn=0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f&tokenOut=0x176211869cA2b568f2A7D4EE941E073a821EE1ff&amountIn=1000000000000000000"
   ```

---

## 📝 總結

### 必須操作：

1. ✅ **更新 Cloudflare Worker 代碼**（使用 `cloudflare-worker-simple.js` 或 `cloudflare-worker.js`）
2. ✅ **刪除舊的 1inch API Key Secret**（已不需要）
3. ✅ **測試 Worker 是否返回 JSON**

### KyberSwap API：

- ✅ **免費開放**，無需 API Key
- ✅ **支持 Linea 鏈**
- ✅ **速率限制**：30 次 / 10 秒（足夠使用）

---

**下一步**：請立即更新 Worker 代碼，然後重新測試！🚀

