// aiboard Worker：KV 持久化版（修复原模块级变量在 Cloudflare 边缘不持久的问题）
// 接口兼容：GET /api/data 返回 { data, updated_at }；POST /api/update 写入（需 Bearer 密码）
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const KEY = "aiboard_data";

    if (request.method === "GET" && url.pathname === "/api/data") {
      const raw = await env.AIBOARD_KV.get(KEY);
      const payload = raw
        ? JSON.parse(raw)
        : { data: { empty: true }, updated_at: null };
      return new Response(JSON.stringify(payload), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (request.method === "POST" && url.pathname === "/api/update") {
      const auth = request.headers.get("Authorization");
      const password = env.PASSWORD || "want2026";
      if (auth !== `Bearer ${password}`) {
        return new Response("Unauthorized", { status: 401, headers: corsHeaders });
      }
      const body = await request.json();
      await env.AIBOARD_KV.put(
        KEY,
        JSON.stringify({ data: body, updated_at: new Date().toISOString() })
      );
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};
