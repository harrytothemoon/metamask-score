# 安全最佳實踐 🔐

## API Key 管理

### ✅ 正確做法

**使用 Cloudflare Workers Secrets**：

```javascript
// cloudflare-worker.js
export default {
  async fetch(request, env) {
    // 從環境變量安全地獲取 API key
    const apiKey = env.ONEINCH_API_KEY;
    
    // 使用 API key
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
  }
}
```

**配置方式**：
1. Cloudflare Dashboard → Worker → Settings
2. Variables and Secrets → Add variable
3. 點擊 **Encrypt** 切換到 Secret 模式
4. 設置 `ONEINCH_API_KEY`

### ❌ 錯誤做法

**永遠不要這樣做**：

```javascript
// ❌ 不要直接寫在代碼中
const apiKey = "sk_1234567890abcdef";

// ❌ 不要提交到 Git
'Authorization': 'Bearer YOUR_ACTUAL_API_KEY_HERE'

// ❌ 不要存在前端代碼中
const VITE_API_KEY = "sk_1234567890abcdef";
```

## 為什麼要使用 Secrets？

### 安全風險

如果把 API key 寫在代碼中：

1. **代碼洩露** 📢
   - 推送到 GitHub 後，API key 永久存在 Git 歷史中
   - 即使後來刪除，仍可在歷史記錄中找到
   - 任何人都可以看到並濫用

2. **額外費用** 💸
   - 別人可以使用你的 API key
   - 超出免費額度會產生費用
   - 可能被惡意濫用

3. **帳號風險** ⚠️
   - API key 可能被封禁
   - 影響服務可用性
   - 需要重新申請和配置

### Secrets 的優勢

使用 Cloudflare Workers Secrets：

1. **加密存儲** 🔒
   - API key 被加密存儲在 Cloudflare
   - 只在運行時可訪問
   - 不會出現在代碼中

2. **方便管理** 🛠️
   - 可以隨時更新
   - 不需要修改代碼
   - 不需要重新部署（只需刷新 Worker）

3. **訪問控制** 👥
   - 只有授權用戶可以查看
   - 可以設置不同環境的不同值
   - 審計日誌記錄

## 環境變量命名規範

### 建議命名

```bash
# ✅ 清晰明確
ONEINCH_API_KEY
DATABASE_URL
JWT_SECRET

# ❌ 模糊不清
API_KEY
KEY
SECRET
```

### 命名原則

1. 使用 `SCREAMING_SNAKE_CASE`
2. 包含服務名稱（如 `ONEINCH_`）
3. 說明用途（如 `_API_KEY`）
4. 避免使用縮寫

## Git 安全

### .gitignore 配置

確保以下文件不被提交：

```gitignore
# 環境變量文件
.env
.env.local
.env.production.local
.env.development.local

# 配置文件
*config.local.js
*secrets.json

# 日誌文件（可能包含敏感信息）
*.log
logs/
```

### 檢查 Git 歷史

如果不小心提交了 API key：

```bash
# 1. 立即更換 API key（在服務提供商那邊）

# 2. 從 Git 歷史中刪除（慎用！）
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/file" \
  --prune-empty --tag-name-filter cat -- --all

# 3. 強制推送（警告：這會改寫歷史）
git push origin --force --all
```

**更好的方法**：
- 直接更換 API key
- 使用新的倉庫
- 未來使用 Secrets

## 前端安全

### 不要在前端存儲敏感信息

```javascript
// ❌ 永遠不要這樣做
const VITE_API_KEY = import.meta.env.VITE_API_KEY;

// ✅ 使用代理服務器
const proxyUrl = import.meta.env.VITE_PROXY_URL; // 只是一個 URL，不是密鑰
```

### 為什麼？

- 前端代碼完全公開
- 任何人都可以查看源代碼
- 瀏覽器開發者工具可以看到所有內容
- 打包後的代碼仍然可以被反編譯

## Cloudflare Workers 安全配置

### 最佳實踐

1. **使用 Secrets 存儲敏感信息**
   ```javascript
   const apiKey = env.ONEINCH_API_KEY;
   ```

2. **驗證請求來源（可選）**
   ```javascript
   const origin = request.headers.get('Origin');
   const allowedOrigins = [
     'https://yourusername.github.io',
     'http://localhost:5173'
   ];
   
   if (!allowedOrigins.includes(origin)) {
     return new Response('Forbidden', { status: 403 });
   }
   ```

3. **速率限制（可選）**
   ```javascript
   // 使用 Cloudflare Workers KV 實現簡單的速率限制
   const rateLimitKey = `rate_limit:${clientIP}`;
   const count = await env.KV.get(rateLimitKey);
   
   if (count > 100) {
     return new Response('Too Many Requests', { status: 429 });
   }
   ```

4. **錯誤處理**
   ```javascript
   // 不要在錯誤信息中洩露敏感信息
   catch (error) {
     console.error(error); // 記錄到日誌
     return new Response(
       JSON.stringify({ error: 'Internal server error' }), // 通用錯誤信息
       { status: 500 }
     );
   }
   ```

## 檢查清單

部署前確認：

- [ ] API key 使用 Secrets 存儲
- [ ] `.env` 文件已加入 `.gitignore`
- [ ] 代碼中沒有硬編碼的密鑰
- [ ] Git 歷史中沒有敏感信息
- [ ] 前端只存儲公開信息（如代理 URL）
- [ ] Worker 有適當的錯誤處理
- [ ] 考慮添加速率限制（可選）
- [ ] 考慮驗證請求來源（可選）

## 如果 API Key 洩露了？

立即行動：

1. **更換 API Key** 🚨
   - 在服務提供商處吊銷舊 key
   - 生成新的 API key
   - 更新 Cloudflare Workers Secrets

2. **檢查使用情況**
   - 查看 API 使用記錄
   - 確認是否有異常請求
   - 檢查帳單

3. **更新配置**
   - 更新所有使用該 key 的地方
   - 測試確保服務正常

4. **預防措施**
   - 檢查代碼倉庫
   - 確保未來不會再次洩露
   - 考慮啟用雙因素認證

## 總結

**核心原則**：

1. 🔐 **永遠不要把敏感信息寫在代碼中**
2. 🔒 **使用環境變量和 Secrets**
3. 📝 **記錄但不暴露詳細錯誤**
4. 🛡️ **最小權限原則**
5. 🔄 **定期更換密鑰**

遵循這些實踐，你的應用會更安全！✨

