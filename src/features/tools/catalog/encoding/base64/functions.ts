export type Base64Result =
	| { ok: true; output: string }
	| { ok: false; error: string };

export function encodeBase64(input: string): Base64Result {
	try {
		const bytes = new TextEncoder().encode(input);
		let binary = '';

		for (const byte of bytes) {
			binary += String.fromCharCode(byte);
		}

		return { ok: true, output: btoa(binary) };
	} catch {
		return { ok: false, error: 'Base64 编码失败。' };
	}
}

export function decodeBase64(input: string): Base64Result {
	try {
		const binary = atob(input.trim());
		const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
		return { ok: true, output: new TextDecoder().decode(bytes) };
	} catch {
		return { ok: false, error: '请输入合法的 Base64 内容。' };
	}
}
