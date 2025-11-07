// Cloudflare Worker 代理腳本 - KyberSwap API (Linea)
// 部署到 Cloudflare Workers 來繞過 CORS 限制

export default {
  async fetch(request, env) {
    // 處理 CORS 預檢請求
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    try {
      const url = new URL(request.url);

      // 從查詢參數獲取目標 API 信息
      const tokenIn = url.searchParams.get("tokenIn");
      const tokenOut = url.searchParams.get("tokenOut");
      const amountIn = url.searchParams.get("amountIn");

      if (!tokenIn || !tokenOut || !amountIn) {
        return new Response(
          JSON.stringify({
            error: "Missing parameters",
            required: ["tokenIn", "tokenOut", "amountIn"],
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      // 構建 KyberSwap API URL (Linea 鏈)
      const kyberswapUrl = new URL(
        "https://aggregator-api.kyberswap.com/linea/api/v1/routes"
      );
      kyberswapUrl.searchParams.append("tokenIn", tokenIn);
      kyberswapUrl.searchParams.append("tokenOut", tokenOut);
      kyberswapUrl.searchParams.append("amountIn", amountIn);
      kyberswapUrl.searchParams.append("gasInclude", "true");
      kyberswapUrl.searchParams.append("saveGas", "false");

      console.log("Calling KyberSwap API:", kyberswapUrl.toString());

      // 調用 KyberSwap API（添加瀏覽器請求頭繞過 Cloudflare 保護）
      const response = await fetch(kyberswapUrl.toString(), {
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Origin: "https://kyberswap.com",
          Referer: "https://kyberswap.com/",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      const kyberswapData = await response.json();

      // 檢查 KyberSwap 返回是否成功
      if (kyberswapData.code !== 0 || !kyberswapData.data) {
        return new Response(
          JSON.stringify({
            error: "KyberSwap API error",
            message: kyberswapData.message,
            data: kyberswapData,
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      // 提取關鍵數據
      const routeSummary = kyberswapData.data.routeSummary;

      // 計算價格影響：(投入 USD - 得到 USD) / 投入 USD * 100
      const amountInUsd = parseFloat(routeSummary.amountInUsd);
      const amountOutUsd = parseFloat(routeSummary.amountOutUsd);
      const priceImpact = ((amountInUsd - amountOutUsd) / amountInUsd) * 100;

      // 轉換為與前端兼容的格式
      const responseData = {
        toAmount: routeSummary.amountOut,
        fromAmount: routeSummary.amountIn,
        priceImpact: priceImpact,
        estimatedPriceImpact: priceImpact,
        gas: routeSummary.gas,
        gasPrice: routeSummary.gasPrice,
        gasUsd: routeSummary.gasUsd,
        route: routeSummary.route,
        // 保留原始數據供調試
        _raw: {
          amountInUsd: routeSummary.amountInUsd,
          amountOutUsd: routeSummary.amountOutUsd,
          exchange: routeSummary.route?.[0]?.[0]?.exchange || "kyberswap",
        },
      };

      console.log("Price Impact Calculation:", {
        amountInUsd,
        amountOutUsd,
        priceImpact: priceImpact.toFixed(4) + "%",
      });

      // 返回結果，添加 CORS 標頭
      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=30", // 緩存 30 秒
        },
      });
    } catch (error) {
      console.error("Worker error:", error);
      return new Response(
        JSON.stringify({
          error: error.message,
          stack: error.stack,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};
