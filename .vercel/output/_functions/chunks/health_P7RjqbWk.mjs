import { j as jsonResponse, g as getRuntimeEnv } from './env_qsTbY6xW.mjs';

const prerender = false;
const GET = () => {
  const env = getRuntimeEnv();
  return jsonResponse({
    ok: true,
    bindings: {
      db: Boolean(env.DB),
      bucket: Boolean(env.BUCKET)
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	GET,
	prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
