# Linea 鏈替代方案

## ⚠️ 問題說明

1inch API 目前 **不支持 Linea 鏈**（chainId: 59144），所以無法直接使用 1inch API 獲取 Linea 上的交易對價格數據。

## 🔍 1inch API 支持的鏈

目前 1inch API v5.2 支持以下鏈：

| 鏈名稱 | Chain ID | 支持狀態 |
|--------|----------|----------|
| Ethereum | 1 | ✅ |
| BNB Chain (BSC) | 56 | ✅ |
| Polygon | 137 | ✅ |
| Optimism | 10 | ✅ |
| Arbitrum | 42161 | ✅ |
| Gnosis | 100 | ✅ |
| Avalanche | 43114 | ✅ |
| Fantom | 250 | ✅ |
| zkSync Era | 324 | ✅ |
| Base | 8453 | ✅ |
| **Linea** | **59144** | ❌ **不支持** |

## 🎯 Linea 上的替代方案

如果你需要查詢 Linea 鏈上的交易對價格影響，可以使用以下方案：

### 方案 1：使用 Linea 原生 DEX API

#### 1. SyncSwap API
- **官網**: https://syncswap.xyz/
- **API 文檔**: https://docs.syncswap.xyz/
- 支持 Linea 鏈
- 提供類似的 quote API

#### 2. Velocore API
- **官網**: https://velocore.xyz/
- Linea 上的主要 DEX
- 可能提供 API 接口

#### 3. Lynex API
- **官網**: https://www.lynex.fi/
- Linea 生態的 DEX
- 查看其開發者文檔

### 方案 2：使用聚合器

#### 1. 0x Protocol
```bash
# 0x API 端點
https://linea.api.0x.org/swap/v1/quote
```

0x Protocol 支持 Linea，可以替代 1inch：

**示例代碼**：
```javascript
const fetchQuoteFrom0x = async (sellToken, buyToken, sellAmount) => {
  const response = await fetch(
    `https://linea.api.0x.org/swap/v1/quote?` +
    `sellToken=${sellToken}&` +
    `buyToken=${buyToken}&` +
    `sellAmount=${sellAmount}`
  );
  return response.json();
};
```

#### 2. KyberSwap API
- 支持多鏈包括 Linea
- API 文檔: https://docs.kyberswap.com/

### 方案 3：直接使用鏈上數據

使用 Web3.js 或 Ethers.js 直接查詢 DEX 智能合約：

```javascript
// 示例：查詢 Uniswap V2 風格的 DEX
const getPrice = async (pairAddress) => {
  const pairContract = new ethers.Contract(
    pairAddress,
    PAIR_ABI,
    provider
  );
  
  const reserves = await pairContract.getReserves();
  const token0 = reserves[0];
  const token1 = reserves[1];
  
  const price = token1 / token0;
  return price;
};
```

## 🔧 如何修改現有代碼

### 選項 A：切換到其他支持的鏈

如果 Ethereum 主網不是必須的，可以切換到其他 1inch 支持的鏈：

```javascript
// 切換到 Arbitrum
const chainId = 42161;

// 切換到 Base
const chainId = 8453;

// 切換到 Polygon
const chainId = 137;
```

### 選項 B：集成 0x API（推薦）

修改 Worker 代碼以支持 0x API：

```javascript
// cloudflare-worker.js
const apiUrl = chainId === 59144
  ? `https://linea.api.0x.org/swap/v1/quote?sellToken=${src}&buyToken=${dst}&sellAmount=${amount}`
  : `https://api.1inch.dev/swap/v5.2/${chainId}/quote?src=${src}&dst=${dst}&amount=${amount}`;
```

### 選項 C：使用多個 API 源

創建一個智能路由，根據鏈 ID 選擇合適的 API：

```javascript
const getApiEndpoint = (chainId) => {
  switch(chainId) {
    case 59144: // Linea
      return {
        baseUrl: 'https://linea.api.0x.org/swap/v1/quote',
        type: '0x'
      };
    case 1: // Ethereum
    case 137: // Polygon
    case 42161: // Arbitrum
      return {
        baseUrl: `https://api.1inch.dev/swap/v5.2/${chainId}/quote`,
        type: '1inch'
      };
    default:
      throw new Error('Unsupported chain');
  }
};
```

## 📊 Linea 代幣地址

如果使用其他 API，這裡是 Linea 上的主要代幣地址：

```javascript
const lineaTokens = {
  ETH: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f', // Wrapped ETH
  USDC: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
  USDT: '0xA219439258ca9da29E9Cc4cE5596924745e12B93',
  DAI: '0x4AF15ec2A0BD43Db75dd04E62FAA3B8EF36b00d5',
  WBTC: '0x3aAB2285ddcDdaD8edf438C1bAB47e1a9D05a9b4',
};
```

## 🎯 當前狀態

**目前應用使用 Ethereum 主網數據**，因為：
1. ✅ 1inch API 完全支持
2. ✅ 數據最可靠和豐富
3. ✅ 無需修改 Worker 代碼
4. ✅ 可以立即使用

## 💡 建議

### 短期（當前）
- 使用 Ethereum 主網數據
- 所有功能正常工作
- 價格影響計算準確

### 中期（如果必須用 Linea）
- 集成 0x API 支持 Linea
- 或使用 Linea 原生 DEX API
- 需要修改 Worker 代碼

### 長期
- 等待 1inch API 添加 Linea 支持
- 或構建多鏈聚合器
- 支持多個數據源

## 📚 相關資源

- [1inch API 文檔](https://docs.1inch.io/)
- [0x API 文檔](https://0x.org/docs/api)
- [Linea 開發者文檔](https://docs.linea.build/)
- [SyncSwap 文檔](https://docs.syncswap.xyz/)

---

**總結**：由於技術限制，當前最佳方案是使用 Ethereum 主網。如果堅持使用 Linea，建議集成 0x API 或其他支持 Linea 的 DEX 聚合器。

