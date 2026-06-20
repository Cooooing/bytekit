export type CssResult =
	| { ok: true; output: string }
	| { ok: false; error: string };

export function minifyCss(input: string): CssResult {
	const trimmed = input.trim();
	if (!trimmed) return { ok: false, error: '请输入 CSS 代码。' };

	try {
		let result = trimmed;
		const bangComments: string[] = [];
		result = result.replace(/\/\*[\s\S]*?\*\//g, (comment) => {
			if (!comment.startsWith('/*!')) return '';
			const marker = `___CSS_BANG_COMMENT_${bangComments.length}___`;
			bangComments.push(comment.trim().replace(/\s+/g, ' '));
			return marker + ' ';
		});
		result = result.replace(/\s+/g, ' ');
		result = result.replace(/\s*([{}:;,])\s*/g, '$1');
		result = result.replace(/;}/g, '}');
		result = result.replace(/___CSS_BANG_COMMENT_(\d+)___/g, (_, index: string) => bangComments[Number(index)] ?? '');
		result = result.trim();
		return { ok: true, output: result };
	} catch (error) {
		return { ok: false, error: error instanceof Error ? error.message : 'CSS 压缩失败。' };
	}
}

export function beautifyCss(input: string): CssResult {
	const trimmed = input.trim();
	if (!trimmed) return { ok: false, error: '请输入 CSS 代码。' };

	try {
		let result = '';
		let indent = 0;

		const cleaned = trimmed
			.replace(/\/\*[\s\S]*?\*\//g, '')
			.replace(/\s+/g, ' ')
			.trim();

		for (let i = 0; i < cleaned.length; i++) {
			const ch = cleaned[i];

			if (ch === '{') {
				result = result.trimEnd() + ' {\n';
				indent++;
				result += '\t'.repeat(indent);
			} else if (ch === '}') {
				indent = Math.max(0, indent - 1);
				result = result.trimEnd() + '\n' + '\t'.repeat(indent) + '}\n';
				if (indent > 0) result += '\t'.repeat(indent);
			} else if (ch === ';') {
				result += ';\n' + '\t'.repeat(indent);
			} else if (ch === ':' && cleaned[i + 1] !== ':') {
				result += ': ';
				i++;
			} else {
				result += ch;
			}
		}

		return { ok: true, output: result.trim() };
	} catch (error) {
		return { ok: false, error: error instanceof Error ? error.message : 'CSS 美化失败。' };
	}
}
