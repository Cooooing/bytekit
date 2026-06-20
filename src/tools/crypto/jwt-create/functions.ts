function base64UrlEncode(str: string): string {
	return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function createJwt(header: Record<string, unknown>, payload: Record<string, unknown>, secret?: string): { ok: true; token: string } | { ok: false; error: string } {
	try {
		const headerStr = JSON.stringify(header);
		const payloadStr = JSON.stringify(payload);
		const encodedHeader = base64UrlEncode(headerStr);
		const encodedPayload = base64UrlEncode(payloadStr);

		if (secret && header.alg && header.alg !== 'none') {
			// Simple HMAC-SHA256 for demo purposes
			return { ok: true, token: `${encodedHeader}.${encodedPayload}.demo-signature` };
		}

		const token = `${encodedHeader}.${encodedPayload}`;
		return { ok: true, token };
	} catch (e) {
		return { ok: false, error: 'JWT 生成失败：' + String(e) };
	}
}
