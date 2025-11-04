# 價格影響計算方案

## 問題

1inch API 的 `quote` 端點**不返回價格影響數據**，所以所有交易對顯示 0.00%。

## 為什麼 quote API 不返回價格影響？

`quote` 端點只返回：
- `toAmount`: 你能得到多少目標代幣
- `estimatedGas`: 預估 gas 費用

它**不包含**：
- `priceImpact`: 價格影響
- `protocols`: 路由信息

## 解決方案

### 方案 1：使用 swap API（需要錢包地址）❌

`swap` API 會返回完整信息包括價格影響，但需要：
- `from`: 錢包地址
- `slippage`: 滑點容忍度

**問題**：需要用戶連接錢包，不適合純查詢場景。

### 方案 2：自己計算價格影響（推薦）✅

**原理**：查詢兩個不同金額，比較價格差異

```javascript
// 1. 查詢小額（比如 $100）
const quote1 = await fetchQuote('ETH', 'USDC', 100);
const price1 = quote1.toAmount / (100 * 1e18);

// 2. 查詢大額（比如 $1000）
const quote2 = await fetchQuote('ETH', 'USDC', 1000);
const price2 = quote2.toAmount / (1000 * 1e18);

// 3. 計算價格影響
const priceImpact = ((price2 - price1) / price1) * 100;
```

### 方案 3：使用固定參考價格

對於穩定幣對（USDT/USDC），理論價格應該是 1:1。

```javascript
if (pair === 'USDC→USDT' || pair === 'USDT→USDC') {
  const actualPrice = toAmount / fromAmount;
  const expectedPrice = 1.0;
  const priceImpact = ((actualPrice - expectedPrice) / expectedPrice) * 100;
}
```

## 實現方案 2（完整代碼）

```javascript
const calculatePriceImpactForPair = async (fromToken, toToken, targetAmount) => {
  // 查詢小額作為基準
  const baseAmount = 100;
  const baseQuote = await fetchQuote(fromToken, toToken, baseAmount);
  
  // 查詢目標金額
  const targetQuote = await fetchQuote(fromToken, toToken, targetAmount);
  
  if (!baseQuote || !targetQuote) return 0;
  
  // 計算每個的單位價格
  const fromDecimals = tokens[fromToken].decimals;
  const toDecimals = tokens[toToken].decimals;
  
  const basePrice = 
    (parseFloat(baseQuote.toAmount) / (10 ** toDecimals)) / baseAmount;
  const targetPrice = 
    (parseFloat(targetQuote.toAmount) / (10 ** toDecimals)) / targetAmount;
  
  // 計算價格影響（價格變差的百分比）
  const priceImpact = ((targetPrice - basePrice) / basePrice) * 100;
  
  return priceImpact;
};
```

## 優化：批量計算

為了減少 API 調用次數，可以：

1. **第一輪**：用小額（$100）查詢所有交易對，建立基準價格
2. **第二輪**：用目標金額查詢所有交易對
3. **計算**：比較兩輪結果，計算價格影響

```javascript
// 第一輪：建立基準
const basePrices = {};
for (const pair of tradingPairs) {
  const quote = await fetchQuote(pair.from, pair.to, 100);
  if (quote) {
    basePrices[`${pair.from}-${pair.to}`] = 
      parseFloat(quote.toAmount) / (100 * 10 ** tokens[pair.from].decimals);
  }
}

// 第二輪：目標金額
const results = [];
for (const pair of tradingPairs) {
  const quote = await fetchQuote(pair.from, pair.to, selectedAmount);
  if (quote) {
    const targetPrice = 
      parseFloat(quote.toAmount) / (selectedAmount * 10 ** tokens[pair.from].decimals);
    const basePrice = basePrices[`${pair.from}-${pair.to}`];
    const priceImpact = ((targetPrice - basePrice) / basePrice) * 100;
    
    results.push({
      pair: `${pair.from} → ${pair.to}`,
      priceImpact: priceImpact,
      price: targetPrice,
      // ... 其他字段
    });
  }
}
```

## 實際使用建議

### 當前方案（快速展示）
- 顯示交易對列表
- 價格影響暫時顯示 0%
- 用戶可以看到價格和其他信息

### 升級方案（完整功能）
- 實現雙重查詢計算價格影響
- 需要額外的 API 調用（每個交易對 2 次）
- 更準確的價格影響數據

## 權衡

| 方案 | API 調用次數 | 準確度 | 實現難度 |
|------|-------------|--------|----------|
| 當前（顯示 0%） | 10 次 | N/A | 簡單 ✅ |
| 自己計算 | 20 次 | 高 | 中等 |
| swap API | 10 次 | 最高 | 需要錢包 ❌ |

## 快速修復建議

### 選項 A：添加說明
告訴用戶價格影響數據暫不可用，主要看價格排序。

### 選項 B：實現方案 2
我可以幫你實現完整的雙重查詢計算。

### 選項 C：只對重要交易對計算
比如只對 USDT/USDC 等穩定幣對計算精確的價格影響。

你想選哪個方案？我可以立即幫你實現！

