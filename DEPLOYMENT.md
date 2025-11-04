# GitHub Pages 部署指南

## 快速開始

### 步驟 1：建立 GitHub 倉庫

1. 登入 GitHub，創建一個新的倉庫
2. 倉庫名稱：`metamask-score`（或其他名稱）
3. 設定為 Public（GitHub Pages 免費版需要公開倉庫）
4. 不要初始化 README、.gitignore 或 license

### 步驟 2：推送代碼到 GitHub

```bash
# 如果還沒有 commit，先提交
git commit -m "Initial commit: 交易對價格影響查詢工具"

# 添加遠端倉庫（替換 YOUR_USERNAME 為你的 GitHub 用戶名）
git remote add origin https://github.com/YOUR_USERNAME/metamask-score.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

### 步驟 3：配置 GitHub Pages

1. 在 GitHub 倉庫頁面，點擊 **Settings**（設置）
2. 在左側菜單找到 **Pages**
3. 在 **Source** 下選擇 `gh-pages` 分支（等待 GitHub Actions 首次運行完成後才會出現）
4. 點擊 **Save**

### 步驟 4：等待自動部署

GitHub Actions 會自動：
- 檢測到推送到 main 分支
- 安裝依賴
- 構建專案
- 部署到 gh-pages 分支

查看部署狀態：
1. 在倉庫頁面點擊 **Actions** 標籤
2. 查看最新的工作流運行狀態
3. 等待顯示綠色勾勾（成功）

### 步驟 5：訪問你的網站

部署成功後，你的網站將可在以下地址訪問：

```
https://YOUR_USERNAME.github.io/metamask-score/
```

## 手動部署（可選）

如果你不想使用 GitHub Actions，可以手動部署：

```bash
# 安裝 gh-pages（如果還沒安裝）
yarn add -D gh-pages

# 構建並部署
yarn deploy
```

## 更新 base URL

如果你的倉庫名稱不是 `metamask-score`，需要更新 `vite.config.js`：

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/你的倉庫名稱/',  // 修改這裡
})
```

## 配置 1inch API Key

為了獲取真實的價格數據，你需要配置 1inch API key：

1. 訪問 [1inch Developer Portal](https://portal.1inch.dev/)
2. 註冊並創建一個 API key
3. 在 `src/components/PriceImpactCalculator.jsx` 中更新：

```javascript
const response = await axios.get(url, { 
  params,
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY_HERE',  // 替換這裡
  }
});
```

## 自訂域名（可選）

如果你想使用自訂域名：

1. 在倉庫根目錄創建 `public/CNAME` 文件
2. 文件內容為你的域名，例如：`example.com`
3. 在你的 DNS 提供商設置 CNAME 記錄指向 `YOUR_USERNAME.github.io`
4. 在 GitHub Settings > Pages 中添加自訂域名

## 疑難排解

### 問題：Actions 無法運行

**解決方案**：
1. 確保在 Settings > Actions > General 中啟用了 Actions
2. 檢查 Workflow permissions 設置為 "Read and write permissions"

### 問題：頁面顯示 404

**解決方案**：
1. 檢查 `vite.config.js` 中的 `base` 路徑是否正確
2. 確保 GitHub Pages 設置為使用 `gh-pages` 分支
3. 等待幾分鐘讓 DNS 更新

### 問題：樣式沒有載入

**解決方案**：
1. 確認 base URL 設置正確
2. 清除瀏覽器緩存
3. 檢查 Network 標籤看看資源是否正確載入

## 本地預覽生產構建

在推送到 GitHub 之前，建議先在本地測試：

```bash
# 構建
yarn build

# 預覽
yarn preview
```

訪問 `http://localhost:4173` 查看生產版本。

## 持續更新

每次你推送代碼到 main 分支，GitHub Actions 都會自動重新構建和部署：

```bash
# 修改代碼後
git add .
git commit -m "更新功能"
git push
```

大約 1-2 分鐘後，你的更改就會在線上生效。

