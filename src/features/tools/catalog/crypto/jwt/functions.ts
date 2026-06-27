export async function createJwt(
	header: Record<string, unknown>,
	payload: Record<string, unknown>,
	secret?: string,
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
	try {
		const enc = new TextEncoder();
		const headerB64 = encodeBase64Url(enc.encode(JSON.stringify(header)));
		const payloadB64 = encodeBase64Url(enc.encode(JSON.stringify(payload)));

		if (!secret || header.alg === 'none') {
			return { ok: true, token: `${headerB64}.${payloadB64}` };
		}

		const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
		const signature = await crypto.subtle.sign('HMAC', key, enc.encode(`${headerB64}.${payloadB64}`));
		const sigB64 = encodeBase64Url(new Uint8Array(signature));

		return { ok: true, token: `${headerB64}.${payloadB64}.${sigB64}` };
	} catch (e) {
		return { ok: false, error: 'JWT 生成失败：' + String(e) };
	}
}

function encodeBase64Url(bytes: Uint8Array): string {
	let binary = '';

	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}

	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export type DecodedJwt =
	| {
			ok: true;
			header: unknown;
			payload: unknown;
			signature: string;
			hasSignature: boolean;
	  }
	| { ok: false; error: string };

function decodeBase64Url(segment: string): string {
	const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
	const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
	const binary = atob(padded);
	const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

	return new TextDecoder().decode(bytes);
}

function parseJsonSegment(segment: string, name: string): unknown {
	try {
		return JSON.parse(decodeBase64Url(segment)) as unknown;
	} catch {
		throw new Error(`${name} 不是合法的 JSON。`);
	}
}

export function decodeJwt(token: string): DecodedJwt {
	const parts = token.trim().split('.');

	if (parts.length < 2 || parts.length > 3 || !parts[0] || !parts[1]) {
		return { ok: false, error: 'JWT 应包含 header、payload 和可选 signature。' };
	}

	try {
		return {
			ok: true,
			header: parseJsonSegment(parts[0], 'Header'),
			payload: parseJsonSegment(parts[1], 'Payload'),
			signature: parts[2] ?? '',
			hasSignature: Boolean(parts[2]),
		};
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : 'JWT 解析失败。',
		};
	}
}
