import type { APIRoute } from 'astro';
import { getRuntimeEnv, jsonResponse } from '../../lib/cloudflare/env';
import { getFile, putFile } from '../../lib/cloudflare/r2';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
	const env = getRuntimeEnv();

	if (!env.BUCKET) {
		return jsonResponse({ ok: false, error: 'R2 binding BUCKET 未配置。' }, { status: 503 });
	}

	const key = url.searchParams.get('key')?.trim();

	if (!key) {
		return jsonResponse({ ok: false, error: '缺少文件 key。' }, { status: 400 });
	}

	const object = await getFile(env.BUCKET, key);

	if (!object) {
		return jsonResponse({ ok: false, error: '文件不存在。' }, { status: 404 });
	}

	return new Response(object.body, {
		headers: {
			'content-type': object.httpMetadata?.contentType ?? 'application/octet-stream',
			'etag': object.httpEtag,
		},
	});
};

export const POST: APIRoute = async ({ request }) => {
	const env = getRuntimeEnv();

	if (!env.BUCKET) {
		return jsonResponse({ ok: false, error: 'R2 binding BUCKET 未配置。' }, { status: 503 });
	}

	const formData = await request.formData();
	const file = formData.get('file');

	if (!(file instanceof File)) {
		return jsonResponse({ ok: false, error: '表单字段 file 必须是文件。' }, { status: 400 });
	}

	const object = await putFile(env.BUCKET, file);

	return jsonResponse({ ok: true, object }, { status: 201 });
};
