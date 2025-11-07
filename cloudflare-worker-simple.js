// 簡化版 Cloudflare Worker - 用於測試
// 複製這個完整代碼到你的 Cloudflare Worker

export default {
  async fetch(request, env) {
    // 處理 CORS 預檢請求
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    try {
      const url = new URL(request.url);

      // 獲取參數
      const tokenIn = url.searchParams.get("tokenIn");
      const tokenOut = url.searchParams.get("tokenOut");
      const amountIn = url.searchParams.get("amountIn");

      // 驗證參數
      if (!tokenIn || !tokenOut || !amountIn) {
        return new Response(
          JSON.stringify({
            error: "缺少參數",
            required: ["tokenIn", "tokenOut", "amountIn"],
            received: { tokenIn, tokenOut, amountIn },
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

      // 構建 KyberSwap API URL
      const kyberswapUrl = `https://aggregator-api.kyberswap.com/linea/api/v1/routes?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn}&gasInclude=true`;

      console.log("Calling KyberSwap:", kyberswapUrl);

      // 調用 KyberSwap API（添加瀏覽器請求頭繞過 Cloudflare 保護）
      const response = await fetch(kyberswapUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Origin: "https://kyberswap.com",
          Referer: "https://kyberswap.com/",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
        },
      });

      // 獲取響應文本（用於調試）
      const responseText = await response.text();

      console.log("KyberSwap status:", response.status);
      console.log("Response preview:", responseText.substring(0, 200));

      // 嘗試解析 JSON
      let kyberswapData;
      try {
        kyberswapData = JSON.parse(responseText);
      } catch (parseError) {
        return new Response(
          JSON.stringify({
            error: "無法解析 KyberSwap 響應",
            status: response.status,
            preview: responseText.substring(0, 500),
            parseError: parseError.message,
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

      // 檢查 KyberSwap 返回
      if (kyberswapData.code !== 0 || !kyberswapData.data) {
        return new Response(
          JSON.stringify({
            error: "KyberSwap API 錯誤",
            message: kyberswapData.message,
            code: kyberswapData.code,
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

      // 提取數據
      const routeSummary = kyberswapData.data.routeSummary;
      const amountInUsd = parseFloat(routeSummary.amountInUsd || 0);
      const amountOutUsd = parseFloat(routeSummary.amountOutUsd || 0);

      // 計算價格影響
      let priceImpact = 0;
      if (amountInUsd > 0) {
        priceImpact = ((amountInUsd - amountOutUsd) / amountInUsd) * 100;
      }

      // 返回格式化數據
      const result = {
        toAmount: routeSummary.amountOut,
        fromAmount: routeSummary.amountIn,
        priceImpact: priceImpact,
        estimatedPriceImpact: priceImpact,
        gas: routeSummary.gas,
        gasPrice: routeSummary.gasPrice,
        gasUsd: routeSummary.gasUsd,
        _raw: {
          amountInUsd: routeSummary.amountInUsd,
          amountOutUsd: routeSummary.amountOutUsd,
          route: routeSummary.route?.[0]?.[0]?.exchange || "kyberswap",
        },
      };

      console.log("Price impact:", priceImpact.toFixed(4) + "%");

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=30",
        },
      });
    } catch (error) {
      console.error("Worker error:", error);

      return new Response(
        JSON.stringify({
          error: error.message,
          stack: error.stack,
          type: error.name,
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
