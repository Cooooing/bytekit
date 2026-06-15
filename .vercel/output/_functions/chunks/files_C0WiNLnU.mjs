import { j as jsonResponse, g as getRuntimeEnv } from './env_qsTbY6xW.mjs';

async function putFile(bucket, file) {
  const key = `${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}/${crypto.randomUUID()}-${file.name}`;
  const contentType = file.type || "application/octet-stream";
  await bucket.put(key, file.stream(), {
    httpMetadata: {
      contentType
    }
  });
  return {
    key,
    size: file.size,
    contentType
  };
}
async function getFile(bucket, key) {
  return bucket.get(key);
}

const prerender = false;
const GET = async ({ url }) => {
  const env = getRuntimeEnv();
  if (!env.BUCKET) {
    return jsonResponse({ ok: false, error: "R2 binding BUCKET 未配置。" }, { status: 503 });
  }
  const key = url.searchParams.get("key")?.trim();
  if (!key) {
    return jsonResponse({ ok: false, error: "缺少文件 key。" }, { status: 400 });
  }
  const object = await getFile(env.BUCKET, key);
  if (!object) {
    return jsonResponse({ ok: false, error: "文件不存在。" }, { status: 404 });
  }
  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "etag": object.httpEtag
    }
  });
};
const POST = async ({ request }) => {
  const env = getRuntimeEnv();
  if (!env.BUCKET) {
    return jsonResponse({ ok: false, error: "R2 binding BUCKET 未配置。" }, { status: 503 });
  }
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return jsonResponse({ ok: false, error: "表单字段 file 必须是文件。" }, { status: 400 });
  }
  const object = await putFile(env.BUCKET, file);
  return jsonResponse({ ok: true, object }, { status: 201 });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	GET,
	POST,
	prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
