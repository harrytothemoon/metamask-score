# 🚀 快速配置指南

## 當前狀態
你看到 "未配置代理服務器" 錯誤是正常的！這是因為還沒有設置 Cloudflare Worker。

## 📋 完整配置步驟

### 步驟 1️⃣：獲取 1inch API Key

在你的 1inch Business Dashboard (https://portal.1inch.dev/):

1. 點擊 **"Applications"**
2. 查看或創建 API Key
3. 複製 API Key（不要包含 "Bearer" 前綴）

### 步驟 2️⃣：設置 Cloudflare Worker

#### A. 註冊 Cloudflare
- 前往：https://dash.cloudflare.com/sign-up
- 註冊免費帳號

#### B. 創建 Worker
1. 登入 Cloudflare Dashboard
2. 左側選擇 **Workers & Pages**
3. 點擊 **Create application** → **Create Worker**
4. 命名：`metamask-score-proxy`
5. 點擊 **Deploy**

#### C. 部署代碼
1. 點擊 **Quick edit**
2. 刪除默認代碼
3. 複製專案中 `cloudflare-worker.js` 的所有內容並貼上
4. 點擊 **Save and deploy**

#### D. 配置 API Key Secret 🔐
1. Worker 頁面 → **Settings** 標籤
2. 找到 **Variables and Secrets**
3. 點擊 **Add variable**
4. **點擊 "Encrypt" 按鈕**（重要！）
5. 填寫：
   ```
   Variable name: ONEINCH_API_KEY
   Value: [貼上你的 1inch API key，不要包含 "Bearer"]
   ```
6. 點擊 **Save and deploy**

#### E. 複製 Worker URL
你的 Worker URL 格式：
```
https://metamask-score-proxy.你的用戶名.workers.dev
```

### 步驟 3️⃣：配置前端環境變量

在專案根目錄創建 `.env.production.local` 文件：

**方法 1：使用命令行**
```bash
cd /Users/harry/Desktop/Others/metamask-score

# 創建文件（替換為你的實際 Worker URL）
echo "VITE_PROXY_URL=https://metamask-score-proxy.你的用戶名.workers.dev" > .env.production.local
```

**方法 2：手動創建**
1. 在專案根目錄新建文件 `.env.production.local`
2. 添加內容：
   ```
   VITE_PROXY_URL=https://你的-worker-url.workers.dev
   ```

⚠️ **記得替換為你實際的 Worker URL！**

### 步驟 4️⃣：重新構建和部署

```bash
# 1. 構建（會讀取 .env.production.local）
yarn build

# 2. 部署
yarn deploy

# 或者提交並讓 GitHub Actions 自動部署
git add -A
git commit -m "Update configuration"
git push
```

### 步驟 5️⃣：測試

1. 訪問：https://harrytothemoon.github.io/metamask-score/
2. 選擇交易對（例如：ETH → USDC）
3. 點擊「計算價格影響」
4. 應該會看到真實的 1inch API 數據！✨

## 🔍 測試 Worker

在瀏覽器中訪問（替換為你的 Worker URL）：
```
https://你的-worker-url.workers.dev?src=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&dst=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&amount=100000000000000000000&chainId=1
```

應該返回 1inch API 的 JSON 數據。

## ❓ 疑難排解

### Worker 返回 "API key not configured"
- ✅ 確認在 Worker Settings 中正確配置了 `ONEINCH_API_KEY`
- ✅ 確認使用了 **Encrypt** 模式（Secret）
- ✅ 確認 API key 沒有包含 "Bearer" 前綴
- ✅ 點擊 "Save and deploy" 後等待幾秒

### 前端仍顯示示範數據
- ✅ 確認 `.env.production.local` 文件存在且內容正確
- ✅ 確認 `VITE_PROXY_URL` 設置為你的實際 Worker URL
- ✅ 重新構建：`yarn build`
- ✅ 清除瀏覽器緩存後重新訪問

### CORS 錯誤
- ✅ 確認 Worker 代碼正確部署
- ✅ 確認代碼中包含 CORS 標頭設置
- ✅ 在 Worker 的日誌中查看錯誤信息

### Worker 測試返回錯誤
- ✅ 檢查 1inch API key 是否有效
- ✅ 確認 API key 有足夠的請求額度
- ✅ 查看 Worker 的 Logs 標籤了解詳細錯誤

## 💡 重要提示

- `.env.production.local` 不會被提交到 Git（已在 .gitignore 中）✅
- Worker 免費版每天有 **100,000 次請求**額度，完全夠用 🎉
- API key 安全地存儲在 Cloudflare Secrets 中，不會洩露 🔐
- 配置一次，之後就可以一直獲取真實數據了 ⚡

## 📚 相關文檔

- `CLOUDFLARE_SETUP.md` - 詳細的 Worker 設置指南
- `SECURITY.md` - 安全最佳實踐（必讀）
- `ENV_CONFIG.md` - 環境變量配置說明
- `當前狀態.md` - 專案當前狀態

## 🎯 快速檢查清單

完成配置前的檢查：

- [ ] 已從 1inch 獲取 API key
- [ ] 已創建 Cloudflare Worker
- [ ] 已在 Worker 中部署代碼
- [ ] 已在 Worker Settings 配置 `ONEINCH_API_KEY` Secret
- [ ] 已獲取 Worker URL
- [ ] 已創建 `.env.production.local` 文件
- [ ] 已在 `.env.production.local` 中設置正確的 Worker URL
- [ ] 已重新構建專案
- [ ] 已測試 Worker URL 可以正常返回數據

全部完成後，享受你的真實價格影響查詢工具吧！🎉

---

**如有問題，請查看相關文檔或檢查 Worker 的 Logs 標籤。**

