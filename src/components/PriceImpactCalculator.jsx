import React, { useState } from "react";
import axios from "axios";

const PriceImpactCalculator = () => {
  const [allResults, setAllResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(1000);

  // Linea 鏈代幣地址（KyberSwap API 支持）
  const tokens = {
    ETH: {
      symbol: "ETH",
      address: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f", // WETH on Linea
      decimals: 18,
    },
    USDC: {
      symbol: "USDC",
      address: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff", // USDC on Linea
      decimals: 6,
    },
    USDT: {
      symbol: "USDT",
      address: "0xA219439258ca9da29E9Cc4cE5596924745e12B93", // USDT on Linea
      decimals: 6,
    },
  };

  // 常用交易對列表（只包含 ETH, USDT, USDC）
  const tradingPairs = [
    { from: "ETH", to: "USDC" },
    { from: "ETH", to: "USDT" },
    { from: "USDC", to: "USDT" },
    { from: "USDT", to: "USDC" },
    { from: "USDC", to: "ETH" },
    { from: "USDT", to: "ETH" },
  ];

  // 查詢金額選項
  const amountOptions = [300, 1000, 5000];

  const fetchQuote = async (fromToken, toToken, amount) => {
    try {
      // 根據代幣 decimals 轉換金額為 wei
      const decimals = tokens[fromToken].decimals;
      const amountInWei = BigInt(Math.floor(amount)) * BigInt(10 ** decimals);
      const amountStr = amountInWei.toString();

      const proxyUrl = "https://metamask-score-proxy.harry811016.workers.dev";

      // 使用 KyberSwap API（通過 Cloudflare Worker 代理）
      const response = await axios.get(proxyUrl, {
        params: {
          tokenIn: tokens[fromToken].address,
          tokenOut: tokens[toToken].address,
          amountIn: amountStr,
        },
      });

      return response.data;
    } catch (err) {
      console.error(
        `Error fetching quote for ${fromToken}→${toToken} $${amount}:`,
        err
      );
      return null;
    }
  };

  const handleCalculateAll = async () => {
    setLoading(true);
    setError(null);
    setAllResults([]);

    try {
      const results = [];

      console.log("開始查詢 Linea 鏈上的交易對數據（KyberSwap）...");

      // 批量查詢所有交易對
      for (const pair of tradingPairs) {
        console.log(`查詢 ${pair.from}→${pair.to} ($${selectedAmount})...`);

        // 查詢目標金額的報價
        const quote = await fetchQuote(pair.from, pair.to, selectedAmount);

        if (quote && quote.toAmount) {
          const fromDecimals = tokens[pair.from].decimals;
          const toDecimals = tokens[pair.to].decimals;

          // 計算價格（每 1 fromToken 能換多少 toToken）
          const toAmountNum = parseFloat(quote.toAmount) / 10 ** toDecimals;
          const price = toAmountNum / selectedAmount;

          // KyberSwap Worker 已經計算好價格影響（基於 USD 價格）
          const priceImpact = quote.priceImpact || quote.estimatedPriceImpact || 0;

          console.log(
            `${pair.from}→${pair.to}: 價格=${price.toFixed(8)}, 影響=${priceImpact.toFixed(2)}%`,
            quote._raw
              ? `(投入=$${quote._raw.amountInUsd}, 得到=$${quote._raw.amountOutUsd})`
              : ""
          );

          results.push({
            pair: `${pair.from} → ${pair.to}`,
            fromToken: pair.from,
            toToken: pair.to,
            amount: selectedAmount,
            priceImpact: priceImpact,
            price: price.toFixed(8),
            toAmount: quote.toAmount,
            fromAmount: (selectedAmount * 10 ** fromDecimals).toString(),
            estimatedGas: quote.gas || "N/A",
            gasUsd: quote.gasUsd || "N/A",
            exchange: quote._raw?.exchange || "KyberSwap",
          });
        }
      }

      // 按價格影響排序（越低越好，包括負數）
      results.sort((a, b) => a.priceImpact - b.priceImpact);

      setAllResults(results);

      if (results.length === 0) {
        setError("無法獲取任何交易對數據，請檢查網絡或稍後再試。");
      } else {
        console.log(
          `✅ 成功獲取 ${results.length} 個交易對的價格影響數據 (Linea 鏈)`
        );
      }
    } catch (err) {
      setError("獲取報價時發生錯誤，請稍後再試。");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPriceImpactColor = (impact) => {
    const impactNum = parseFloat(impact);
    if (impactNum < 0) return "text-green-600 font-bold"; // 負數=有利
    if (impactNum < 0.1) return "text-green-600";
    if (impactNum < 1) return "text-yellow-600";
    if (impactNum < 3) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Linea 鏈 DEX 價格影響排名
        </h2>
        <p className="text-sm text-purple-600 mb-2">
          📊 數據來源：KyberSwap 聚合器（與 MetaMask 小狐狸一致）
        </p>
        <p className="text-xs text-gray-500 mb-4">
          查詢 Linea 鏈上 ETH/USDT/USDC 交易對的真實價格影響
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            選擇查詢金額
          </label>
          <div className="flex gap-4">
            {amountOptions.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedAmount === amount
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                ${amount}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCalculateAll}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? "查詢中..." : "查詢所有交易對"}
        </button>

        {loading && (
          <div className="mt-4 text-center text-gray-600">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              <p>
                正在查詢 Linea 鏈上 {tradingPairs.length} 個交易對...
                <br />
                <span className="text-sm text-gray-500">
                  （使用 KyberSwap 聚合器，約需 {tradingPairs.length} 秒）
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}

      {allResults.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              價格影響排名（${selectedAmount}）
            </h3>
            <span className="text-sm text-gray-600">
              共 {allResults.length} 個交易對
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    排名
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    交易對
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    價格影響
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    價格
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    預估Gas
                  </th>
                </tr>
              </thead>
              <tbody>
                {allResults.map((result, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      result.priceImpact < 0 ? "bg-green-50" : ""
                    }`}
                  >
                    <td className="px-4 py-4">
                      <span className="text-lg font-semibold text-gray-800">
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-base font-medium text-gray-800">
                        {result.pair}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-lg font-bold ${getPriceImpactColor(
                          result.priceImpact
                        )}`}
                      >
                        {result.priceImpact > 0 ? "+" : ""}
                        {result.priceImpact.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600 font-mono text-sm">
                      {result.price}
                    </td>
                    <td className="px-4 py-4 text-gray-600 text-sm">
                      {result.estimatedGas}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">價格影響說明：</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <span className="text-green-600 font-semibold">&lt; 0%</span>
                ：負數表示有利的價格（推薦）
              </li>
              <li>
                •{" "}
                <span className="text-green-600 font-semibold">&lt; 0.1%</span>
                ：影響很小，適合交易
              </li>
              <li>
                •{" "}
                <span className="text-yellow-600 font-semibold">0.1% - 1%</span>
                ：影響輕微，可接受
              </li>
              <li>
                • <span className="text-orange-600 font-semibold">1% - 3%</span>
                ：影響較大，需謹慎
              </li>
              <li>
                • <span className="text-red-600 font-semibold">&gt; 3%</span>
                ：影響顯著，不建議交易
              </li>
            </ul>
            <p className="text-xs text-blue-700 mt-2">
              * 數據來自 Ethereum 主網的 1inch API
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceImpactCalculator;
