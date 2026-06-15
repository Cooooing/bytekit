import { j as jsonResponse, g as getRuntimeEnv } from './env_qsTbY6xW.mjs';

async function createShare(db, input) {
  const record = {
    id: crypto.randomUUID(),
    tool: input.tool,
    content: input.content,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    expires_at: input.expiresAt ?? null
  };
  await db.prepare(
    "INSERT INTO shares (id, tool, content, created_at, expires_at) VALUES (?, ?, ?, ?, ?)"
  ).bind(record.id, record.tool, record.content, record.created_at, record.expires_at).run();
  return record;
}
async function getShare(db, id) {
  const record = await db.prepare("SELECT id, tool, content, created_at, expires_at FROM shares WHERE id = ?").bind(id).first();
  return record ?? null;
}

const prerender = false;
function readPayload(value) {
  if (!value || typeof value !== "object") {
    return {};
  }
  return value;
}
const GET = async ({ url }) => {
  const env = getRuntimeEnv();
  if (!env.DB) {
    return jsonResponse({ ok: false, error: "D1 binding DB 未配置。" }, { status: 503 });
  }
  const id = url.searchParams.get("id")?.trim();
  if (!id) {
    return jsonResponse({ ok: false, error: "缺少分享 ID。" }, { status: 400 });
  }
  const record = await getShare(env.DB, id);
  if (!record) {
    return jsonResponse({ ok: false, error: "分享内容不存在。" }, { status: 404 });
  }
  if (record.expires_at && new Date(record.expires_at) < /* @__PURE__ */ new Date()) {
    return jsonResponse({ ok: false, error: "分享内容已过期。" }, { status: 410 });
  }
  return jsonResponse({ ok: true, record });
};
const POST = async ({ request }) => {
  const env = getRuntimeEnv();
  if (!env.DB) {
    return jsonResponse({ ok: false, error: "D1 binding DB 未配置。" }, { status: 503 });
  }
  let payload;
  try {
    payload = readPayload(await request.json());
  } catch {
    return jsonResponse({ ok: false, error: "请求体必须是 JSON。" }, { status: 400 });
  }
  if (typeof payload.tool !== "string" || payload.tool.trim() === "") {
    return jsonResponse({ ok: false, error: "tool 必须是非空字符串。" }, { status: 400 });
  }
  if (typeof payload.content !== "string" || payload.content.trim() === "") {
    return jsonResponse({ ok: false, error: "content 必须是非空字符串。" }, { status: 400 });
  }
  if (payload.expiresAt !== void 0 && payload.expiresAt !== null && typeof payload.expiresAt !== "string") {
    return jsonResponse({ ok: false, error: "expiresAt 必须是字符串或 null。" }, { status: 400 });
  }
  const record = await createShare(env.DB, {
    tool: payload.tool.trim(),
    content: payload.content,
    expiresAt: payload.expiresAt ?? null
  });
  return jsonResponse({ ok: true, record }, { status: 201 });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	GET,
	POST,
	prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
