// GET /api/data
// 同域部署在 Pages 上，绕开 workers.dev 在境内不可达的问题

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "no-store",
};

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}

export async function onRequestGet(context) {
  const { env } = context;

  if (!env.AIBOARD_KV) {
    return json({ error: "KV_NOT_BOUND", hint: "Pages 设置里未绑定 AIBOARD_KV" }, 500);
  }

  const raw = await env.AIBOARD_KV.get("aiboard_data");
  if (!raw) {
    return json({ data: { empty: true }, updated_at: null });
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (e) {
    return json({ error: "BAD_PAYLOAD", message: String(e) }, 500);
  }

  return json(payload);
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
}
