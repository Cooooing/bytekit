export function escapeJsString(text: string): { ok: true; output: string } | { ok: false; error: string } {
	try {
		const output = text
			.replace(/\\/g, '\\\\')
			.replace(/'/g, "\\'")
			.replace(/"/g, '\\"')
			.replace(/\n/g, '\\n')
			.replace(/\r/g, '\\r')
			.replace(/\t/g, '\\t')
			.replace(/\0/g, '\\0')
			.replace(/[\x00-\x1f\x7f]/g, (char) => {
				const code = char.charCodeAt(0);
				return '\\x' + code.toString(16).padStart(2, '0');
			});
		return { ok: true, output };
	} catch (e) {
		return { ok: false, error: String(e) };
	}
}

export function unescapeJsString(text: string): { ok: true; output: string } | { ok: false; error: string } {
	try {
		const output = text
			.replace(/\\x([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
			.replace(/\\u([0-9a-f]{4})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
			.replace(/\\n/g, '\n')
			.replace(/\\r/g, '\r')
			.replace(/\\t/g, '\t')
			.replace(/\\0/g, '\0')
			.replace(/\\\\/g, '\\')
			.replace(/\\"/g, '"')
			.replace(/\\'/g, "'");
		return { ok: true, output };
	} catch (e) {
		return { ok: false, error: String(e) };
	}
}
