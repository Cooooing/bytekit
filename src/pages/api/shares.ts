import type { APIRoute } from 'astro';
import { createShare, getShare } from '../../lib/cloudflare/d1';
import { getRuntimeEnv, jsonResponse } from '../../lib/cloudflare/env';

interface SharePayload {
	tool?: unknown;
	content?: unknown;
	expiresAt?: unknown;
}

export const prerender = false;

function readPayload(value: unknown): SharePayload {
	if (!value || typeof value !== 'object') {
		return {};
	}

	return value as SharePayload;
}

export const GET: APIRoute = async ({ url }) => {
	const env = getRuntimeEnv();

	if (!env.DB) {
		return jsonResponse({ ok: false, error: 'D1 binding DB 未配置。' }, { status: 503 });
	}

	const id = url.searchParams.get('id')?.trim();

	if (!id) {
		return jsonResponse({ ok: false, error: '缺少分享 ID。' }, { status: 400 });
	}

	const record = await getShare(env.DB, id);

	if (!record) {
		return jsonResponse({ ok: false, error: '分享内容不存在。' }, { status: 404 });
	}

	if (record.expires_at && new Date(record.expires_at) < new Date()) {
		return jsonResponse({ ok: false, error: '分享内容已过期。' }, { status: 410 });
	}

	return jsonResponse({ ok: true, record });
};

export const POST: APIRoute = async ({ request }) => {
	const env = getRuntimeEnv();

	if (!env.DB) {
		return jsonResponse({ ok: false, error: 'D1 binding DB 未配置。' }, { status: 503 });
	}

	let payload: SharePayload;

	try {
		payload = readPayload(await request.json());
	} catch {
		return jsonResponse({ ok: false, error: '请求体必须是 JSON。' }, { status: 400 });
	}

	if (typeof payload.tool !== 'string' || payload.tool.trim() === '') {
		return jsonResponse({ ok: false, error: 'tool 必须是非空字符串。' }, { status: 400 });
	}

	if (typeof payload.content !== 'string' || payload.content.trim() === '') {
		return jsonResponse({ ok: false, error: 'content 必须是非空字符串。' }, { status: 400 });
	}

	if (
		payload.expiresAt !== undefined &&
		payload.expiresAt !== null &&
		typeof payload.expiresAt !== 'string'
	) {
		return jsonResponse({ ok: false, error: 'expiresAt 必须是字符串或 null。' }, { status: 400 });
	}

	const record = await createShare(env.DB, {
		tool: payload.tool.trim(),
		content: payload.content,
		expiresAt: payload.expiresAt ?? null,
	});

	return jsonResponse({ ok: true, record }, { status: 201 });
};
