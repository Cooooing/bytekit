import type { APIRoute } from 'astro';
import { getRuntimeEnv, jsonResponse } from '../../lib/cloudflare/env';

export const prerender = false;

export const GET: APIRoute = () => {
	const env = getRuntimeEnv();

	return jsonResponse({
		ok: true,
		bindings: {
			db: Boolean(env.DB),
			bucket: Boolean(env.BUCKET),
		},
	});
};
