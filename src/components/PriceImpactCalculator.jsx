import React, { useState } from "react";
import axios from "axios";

const PriceImpactCalculator = () => {
  const [tokenFrom, setTokenFrom] = useState(
    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
  ); // ETH
  const [tokenTo, setTokenTo] = useState(
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
  ); // USDC
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 常見代幣列表
  const popularTokens = [
    {
      symbol: "ETH",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      decimals: 18,
    },
    {
      symbol: "USDC",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
    },
    {
      symbol: "USDT",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 6,
    },
    {
      symbol: "DAI",
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      decimals: 18,
    },
    {
      symbol: "WBTC",
      address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      decimals: 8,
    },
    {
      symbol: "UNI",
      address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      decimals: 18,
    },
  ];

  const calculatePriceImpact = (expectedPrice, actualPrice) => {
    if (!expectedPrice || !actualPrice) return 0;
    const impact = ((actualPrice - expectedPrice) / expectedPrice) * 100;
    return impact;
  };

  const fetchQuote = async (amount) => {
    try {
      const chainId = 1; // Ethereum mainnet
      const amountInWei = (amount * 1e18).toString(); // 假設 from token 是 18 decimals

      // 檢查是否配置了 Cloudflare Worker 代理
      const proxyUrl = import.meta.env.VITE_PROXY_URL;

      let url, config;

      if (proxyUrl) {
        // 生產環境：使用 Cloudflare Worker 代理
        url = proxyUrl;
        config = {
          params: {
            src: tokenFrom,
            dst: tokenTo,
            amount: amountInWei,
            chainId: chainId,
          },
        };
      } else if (import.meta.env.DEV) {
        // 開發環境：使用 Vite 代理
        url = `/api/1inch/swap/v5.2/${chainId}/quote`;
        config = {
          params: {
            src: tokenFrom,
            dst: tokenTo,
            amount: amountInWei,
          },
        };
      } else {
        // 無代理配置，直接拋出錯誤，使用示範數據
        throw new Error("未配置代理服務器，請查看 CLOUDFLARE_SETUP.md");
      }

      const response = await axios.get(url, config);
      return response.data;
    } catch (err) {
      console.error(`Error fetching quote for $${amount}:`, err);
      throw err;
    }
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const amounts = [100, 1000, 10000];
      const quotes = await Promise.all(
        amounts.map((amount) =>
          fetchQuote(amount).catch((err) => ({ error: err.message, amount }))
        )
      );

      // 使用第一個報價作為基準價格
      const baseQuote = quotes[0];
      let basePrice = null;

      if (!baseQuote.error) {
        basePrice = baseQuote.toAmount / baseQuote.fromAmount;
      }

      const processedResults = quotes.map((quote, index) => {
        if (quote.error) {
          return {
            amount: amounts[index],
            error: quote.error,
          };
        }

        const currentPrice = quote.toAmount / quote.fromAmount;
        const priceImpact = basePrice
          ? calculatePriceImpact(basePrice, currentPrice)
          : 0;

        return {
          amount: amounts[index],
          fromAmount: quote.fromAmount,
          toAmount: quote.toAmount,
          price: currentPrice,
          priceImpact: priceImpact.toFixed(2),
          estimatedGas: quote.estimatedGas || "N/A",
        };
      });

      setResults(processedResults);
    } catch (err) {
      const isDev = import.meta.env.DEV;
      const hasProxy = import.meta.env.VITE_PROXY_URL;

      let errorMsg = "獲取報價時發生錯誤。";

      if (!hasProxy && !isDev) {
        errorMsg =
          "需要配置 Cloudflare Worker 代理才能獲取真實數據。請參考 CLOUDFLARE_SETUP.md 文件。";
      } else {
        errorMsg = "無法連接到 API，請稍後再試。";
      }

      setError(errorMsg);
      console.error(err);

      // 顯示模擬數據
      const fromToken = popularTokens.find((t) => t.address === tokenFrom);
      const toToken = popularTokens.find((t) => t.address === tokenTo);

      setResults([
        {
          amount: 100,
          priceImpact: "0.05",
          price: 0.0003,
          estimatedGas: "150000",
          demo: true,
          pair: `${fromToken?.symbol || "Token"} → ${
            toToken?.symbol || "Token"
          }`,
        },
        {
          amount: 1000,
          priceImpact: "0.42",
          price: 0.00031,
          estimatedGas: "150000",
          demo: true,
          pair: `${fromToken?.symbol || "Token"} → ${
            toToken?.symbol || "Token"
          }`,
        },
        {
          amount: 10000,
          priceImpact: "3.85",
          price: 0.00033,
          estimatedGas: "150000",
          demo: true,
          pair: `${fromToken?.symbol || "Token"} → ${
            toToken?.symbol || "Token"
          }`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getPriceImpactColor = (impact) => {
    const impactNum = Math.abs(parseFloat(impact));
    if (impactNum < 0.1) return "text-green-600";
    if (impactNum < 1) return "text-yellow-600";
    if (impactNum < 3) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">選擇交易對</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              從（From Token）
            </label>
            <select
              value={tokenFrom}
              onChange={(e) => setTokenFrom(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {popularTokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              到（To Token）
            </label>
            <select
              value={tokenTo}
              onChange={(e) => setTokenTo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {popularTokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading || tokenFrom === tokenTo}
          className="mt-6 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? "計算中..." : "計算價格影響"}
        </button>

        {tokenFrom === tokenTo && (
          <p className="mt-2 text-red-500 text-sm">請選擇不同的代幣</p>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">{error}</p>
          {results && (
            <p className="text-yellow-600 text-xs mt-2">以下顯示為示範數據</p>
          )}
        </div>
      )}

      {results && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">價格影響結果</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    交易金額
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    價格影響
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    預估Gas
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    狀態
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4">
                      <span className="text-lg font-semibold text-gray-800">
                        ${result.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {result.error ? (
                        <span className="text-red-500 text-sm">錯誤</span>
                      ) : (
                        <span
                          className={`text-lg font-bold ${getPriceImpactColor(
                            result.priceImpact
                          )}`}
                        >
                          {result.priceImpact > 0 ? "+" : ""}
                          {result.priceImpact}%
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {result.estimatedGas}
                    </td>
                    <td className="px-4 py-4">
                      {result.demo ? (
                        <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          示範
                        </span>
                      ) : result.error ? (
                        <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                          失敗
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          成功
                        </span>
                      )}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceImpactCalculator;
