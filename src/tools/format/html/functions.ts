export function formatHtml(html: string): { ok: true; output: string } | { ok: false; error: string } {
	try {
		let formatted = '';
		let indent = 0;
		const selfClosing = /^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b/i;
		const lines = html.replace(/>\s*</g, '>\n<').split('\n');
		for (let line of lines) {
			line = line.trim();
			if (!line) continue;
			if (line.startsWith('</')) indent--;
			formatted += '  '.repeat(Math.max(0, indent)) + line + '\n';
			if (line.startsWith('<') && !line.startsWith('</') && !line.startsWith('<!--') && !line.startsWith('<?') && !selfClosing.test(line) && !line.endsWith('/>')) indent++;
		}
		return { ok: true, output: formatted.trim() };
	} catch (e) {
		return { ok: false, error: 'HTML 格式化失败：' + String(e) };
	}
}

export function minifyHtml(html: string): { ok: true; output: string } | { ok: false; error: string } {
	try {
		const output = html
			.replace(/<!--[\s\S]*?-->/g, '')
			.replace(/>\s+</g, '><')
			.replace(/\s+/g, ' ')
			.trim();
		return { ok: true, output };
	} catch (e) {
		return { ok: false, error: 'HTML 压缩失败：' + String(e) };
	}
}
