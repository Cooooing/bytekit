export interface BytekitEnv {
	ASSETS?: Fetcher;
	DB?: D1Database;
	BUCKET?: R2Bucket;
}

let cloudflareEnv: Record<string, unknown> = {};

// Dynamically import Cloudflare bindings (fails gracefully on non-CF platforms)
try {
	const mod = await import('cloudflare:workers');
	cloudflareEnv = mod.env ?? {};
} catch {
	// Not running on Cloudflare — bindings will be undefined
}

export function getRuntimeEnv(): Partial<BytekitEnv> {
	return cloudflareEnv as Partial<BytekitEnv>;
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
