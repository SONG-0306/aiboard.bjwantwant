// POST /api/update
// 鉴权：Authorization: Bearer <PASSWORD>
// PASSWORD 通过 Pages 环境变量注入，不写进代码

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.AIBOARD_KV) {
    return json({ error: "KV_NOT_BOUND" }, 500);
  }

  // 兼容面板上中文变量名「秘钥 / 密钥」与标准名 PASSWORD
  const pw = env.PASSWORD || env["秘钥"] || env["密钥"];
  if (!pw) {
    return json(
      { error: "PASSWORD_NOT_SET", hint: "Pages 变量里需要 PASSWORD，或命名为「秘钥」" },
      500
    );
  }

  const auth = request.headers.get("Authorization") || "";
  if (auth !== `Bearer ${pw}`) {
    return json({ error: "UNAUTHORIZED" }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "INVALID_JSON" }, 400);
  }

  if (!body || typeof body !== "object") {
    return json({ error: "INVALID_BODY" }, 400);
  }

  const updatedAt = new Date().toISOString();
  await env.AIBOARD_KV.put(
    "aiboard_data",
    JSON.stringify({ data: body, updated_at: updatedAt })
  );

  return json({ ok: true, updated_at: updatedAt, bytes: JSON.stringify(body).length });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
}
