import { env } from 'cloudflare:workers';

export interface BytekitEnv {
	ASSETS: Fetcher;
	DB?: D1Database;
	BUCKET?: R2Bucket;
}

export function getRuntimeEnv(): Partial<BytekitEnv> {
	return env as Partial<BytekitEnv>;
}

export function jsonResponse(data: unknown, init?: ResponseInit): Response {
	return new Response(JSON.stringify(data), {
		...init,
		headers: {
			'content-type': 'application/json; charset=utf-8',
			...init?.headers,
		},
	});
}
