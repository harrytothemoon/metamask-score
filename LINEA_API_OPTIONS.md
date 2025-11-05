# Linea 鏈 API 替代方案分析

## 📋 問題現狀

- **目標**：獲取 Linea 鏈上 ETH/USDT/USDC 交易對的價格影響
- **需求**：與 MetaMask 小狐狸顯示的數據一致
- **限制**：1inch API 不支持 Linea (chainId: 59144)

---

## 🔍 MetaMask 在 Linea 上使用什麼？

MetaMask Swaps 是一個聚合器，會調用多個數據源：

1. **主要使用**：0x API (MetaMask 的主要合作夥伴)
2. **備選**：其他 DEX 聚合器
3. **數據來源**：Linea 上的主流 DEX

---

## 💡 推薦方案（優先級排序）

### ⭐ 方案 1：KyberSwap Aggregator API【推薦】

**優點**：
- ✅ 官方支持 Linea 鏈
- ✅ 免費的聚合器 API
- ✅ 提供價格影響數據
- ✅ 類似 1inch 的使用體驗
- ✅ 高流動性聚合

**API 端點**：
```
GET https://aggregator-api.kyberswap.com/linea/api/v1/routes
```

**請求參數**：
```javascript
{
  "tokenIn": "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f",  // WETH
  "tokenOut": "0x176211869cA2b568f2A7D4EE941E073a821EE1ff", // USDC
  "amountIn": "1000000000000000000",  // 1 ETH in wei
  "gasInclude": true,
  "saveGas": false
}
```

**返回數據**：
- `inputAmount`: 輸入金額
- `outputAmount`: 輸出金額
- `priceImpact`: **價格影響** ✅
- `routeSummary`: 路由信息
- `gas`: Gas 估算

**文檔**：https://docs.kyberswap.com/kyberswap-solutions/kyberswap-aggregator/developer-guides/aggregator-api-specification

---

### 🌟 方案 2：0x API (Matcha)

**狀態**：需要確認是否支持 Linea

**API 端點**（如果支持）：
```
GET https://linea.api.0x.org/swap/v1/quote
```

**優點**：
- ✅ MetaMask 官方使用
- ✅ 數據最接近小狐狸顯示
- ✅ 免費額度充足

**檢查方式**：
```bash
curl https://linea.api.0x.org/swap/v1/quote?sellToken=ETH&buyToken=USDC&sellAmount=1000000000000000000
```

**文檔**：https://0x.org/docs/api

---

### 🔧 方案 3：直接調用 Linea DEX

**主要 DEX**：
1. **Lynex** - 最大 TVL ($97M)
2. **SyncSwap** - 高交易量
3. **PancakeSwap V3** - 熟悉的接口

**優點**：
- ✅ 數據最直接
- ✅ 無 API 速率限制

**缺點**：
- ❌ 需要自己計算價格影響
- ❌ 需要直接調用智能合約
- ❌ 技術複雜度高

---

### 📊 方案 4：使用 The Graph (GraphQL)

**Linea Subgraphs**：
- SyncSwap Subgraph
- PancakeSwap Subgraph

**優點**：
- ✅ 豐富的歷史數據
- ✅ GraphQL 查詢靈活

**缺點**：
- ❌ 需要自己計算價格影響
- ❌ 實時性可能略差

---

## 🎯 最終推薦：KyberSwap API

### 為什麼選擇 KyberSwap？

1. **官方支持 Linea**：明確在文檔中列出
2. **完整的聚合器**：類似 1inch，聚合多個 DEX
3. **提供價格影響**：直接返回 `priceImpact` 字段
4. **免費使用**：無需 API Key 即可開始
5. **穩定可靠**：大型項目，長期維護

### Linea 上的代幣地址

```javascript
const LINEA_TOKENS = {
  ETH: {
    symbol: "ETH",
    address: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f", // WETH
    decimals: 18,
  },
  USDC: {
    symbol: "USDC",
    address: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff",
    decimals: 6,
  },
  USDT: {
    symbol: "USDT",
    address: "0xA219439258ca9da29E9Cc4cE5596924745e12B93",
    decimals: 6,
  },
};
```

---

## 🔄 實現步驟

### 1. 測試 KyberSwap API

```bash
# 測試 ETH -> USDC
curl "https://aggregator-api.kyberswap.com/linea/api/v1/routes?tokenIn=0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f&tokenOut=0x176211869cA2b568f2A7D4EE941E073a821EE1ff&amountIn=1000000000000000000"
```

### 2. 更新 Cloudflare Worker

```javascript
// cloudflare-worker.js
const KYBERSWAP_API = "https://aggregator-api.kyberswap.com";

async function fetchKyberSwapQuote(chainId, tokenIn, tokenOut, amountIn) {
  const url = `${KYBERSWAP_API}/linea/api/v1/routes?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn}&gasInclude=true`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return {
    toAmount: data.data.routeSummary.amountOut,
    fromAmount: data.data.routeSummary.amountIn,
    priceImpact: data.data.routeSummary.priceImpact, // ✅ 直接獲取價格影響
    gas: data.data.routeSummary.gas,
    route: data.data.routeSummary.route,
  };
}
```

### 3. 更新前端代碼

```javascript
// src/components/PriceImpactCalculator.jsx
const chainId = 59144; // Linea
const tokens = LINEA_TOKENS; // 使用 Linea 代幣地址
```

---

## 📝 備選：如果 KyberSwap 不滿意

### Plan B：組合多個數據源

```javascript
// 1. 嘗試 KyberSwap
// 2. 如果失敗，嘗試 0x API
// 3. 如果都失敗，直接查詢 SyncSwap/Lynex 合約
```

---

## 🚀 快速測試命令

```bash
# 1. 測試 KyberSwap API（Linea）
curl "https://aggregator-api.kyberswap.com/linea/api/v1/routes?tokenIn=0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f&tokenOut=0x176211869cA2b568f2A7D4EE941E073a821EE1ff&amountIn=1000000000000000000"

# 2. 測試 0x API（Linea）- 可能不支持
curl "https://linea.api.0x.org/swap/v1/quote?sellToken=0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f&buyToken=0x176211869cA2b568f2A7D4EE941E073a821EE1ff&sellAmount=1000000000000000000"
```

---

## ⚠️ 注意事項

1. **API 速率限制**：
   - KyberSwap：免費版約 100 次/分鐘
   - 建議添加請求緩存

2. **代幣地址驗證**：
   - 確保使用 Linea 上的正確代幣地址
   - ETH 使用 WETH 地址

3. **價格影響單位**：
   - KyberSwap 返回的 `priceImpact` 可能是小數（如 0.05）或百分比（如 5）
   - 需要根據返回值調整顯示格式

4. **CORS 問題**：
   - 仍需使用 Cloudflare Worker 作為代理
   - 更新 Worker 以支持 KyberSwap API

---

## 📚 參考鏈接

- [KyberSwap 文檔](https://docs.kyberswap.com/)
- [KyberSwap Aggregator API](https://docs.kyberswap.com/kyberswap-solutions/kyberswap-aggregator/developer-guides/aggregator-api-specification)
- [Linea 區塊鏈瀏覽器](https://lineascan.build/)
- [Linea DEX 數據 (WhatToFarm)](https://whattofarm.io/zh/blockchain/linea)

---

## ✅ 下一步行動

1. **測試 KyberSwap API**：確認返回數據格式
2. **更新代幣地址**：使用 Linea 的 WETH, USDC, USDT
3. **修改 Cloudflare Worker**：支持 KyberSwap 端點
4. **更新前端**：chainId 改為 59144
5. **測試部署**：確保所有功能正常

---

**想要我直接幫你實現 KyberSwap 方案嗎？** 🚀

