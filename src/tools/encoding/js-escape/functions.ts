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
		let output = '';

		for (let index = 0; index < text.length; index++) {
			const char = text[index];
			if (char !== '\\') {
				output += char;
				continue;
			}

			const next = text[index + 1];
			if (next === undefined) {
				output += char;
				continue;
			}

			if (next === '\\') {
				output += '\\';
				index += 1;
				continue;
			}

			if (next === 'x') {
				const hex = text.slice(index + 2, index + 4);
				if (!/^[0-9a-fA-F]{2}$/.test(hex)) {
					return { ok: false, error: '存在无效的 \\x 转义序列，应使用两位十六进制字符。' };
				}
				output += String.fromCharCode(parseInt(hex, 16));
				index += 3;
				continue;
			}

			if (next === 'u') {
				if (text[index + 2] === '{') {
					const closeIndex = text.indexOf('}', index + 3);
					const hex = closeIndex === -1 ? '' : text.slice(index + 3, closeIndex);
					if (!/^[0-9a-fA-F]{1,6}$/.test(hex)) {
						return { ok: false, error: '存在无效的 \\u 转义序列，应使用四位十六进制字符或 \\u{...} 格式。' };
					}
					const codePoint = parseInt(hex, 16);
					if (codePoint > 0x10ffff) throw new Error('Unicode 码点超出有效范围。');
					output += String.fromCodePoint(codePoint);
					index = closeIndex;
					continue;
				}

				const hex = text.slice(index + 2, index + 6);
				if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
					return { ok: false, error: '存在无效的 \\u 转义序列，应使用四位十六进制字符或 \\u{...} 格式。' };
				}
				output += String.fromCharCode(parseInt(hex, 16));
				index += 5;
				continue;
			}

			const simpleEscapes: Record<string, string> = {
				n: '\n',
				r: '\r',
				t: '\t',
				0: '\0',
				'"': '"',
				"'": "'",
			};
			if (next in simpleEscapes) {
				output += simpleEscapes[next];
				index += 1;
				continue;
			}

			output += char + next;
			index += 1;
		}

		return { ok: true, output };
	} catch (e) {
		return { ok: false, error: e instanceof Error ? e.message : String(e) };
	}
}
