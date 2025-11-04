// Cloudflare Worker 代理腳本
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
      const src = url.searchParams.get("src");
      const dst = url.searchParams.get("dst");
      const amount = url.searchParams.get("amount");
      const chainId = url.searchParams.get("chainId") || "1";

      if (!src || !dst || !amount) {
        return new Response(JSON.stringify({ error: "Missing parameters" }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      // 構建 1inch API URL
      const apiUrl = `https://api.1inch.dev/swap/v5.2/${chainId}/quote?src=${src}&dst=${dst}&amount=${amount}`;

      // 從環境變量獲取 API key（使用 Cloudflare Workers Secrets）
      const apiKey = env.ONEINCH_API_KEY;

      if (!apiKey) {
        return new Response(
          JSON.stringify({
            error:
              "API key not configured. Please set ONEINCH_API_KEY in Worker secrets.",
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

      // 調用 1inch API
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const data = await response.json();

      // 返回結果，添加 CORS 標頭
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=60", // 緩存 1 分鐘
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
};
