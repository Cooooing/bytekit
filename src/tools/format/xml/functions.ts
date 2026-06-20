export function formatXml(xml: string): { ok: true; output: string } | { ok: false; error: string } {
	try {
		let formatted = '';
		let indent = 0;
		const lines = xml.replace(/>\s*</g, '>\n<').split('\n');
		for (let line of lines) {
			line = line.trim();
			if (!line) continue;
			if (line.startsWith('</')) indent--;
			formatted += '  '.repeat(Math.max(0, indent)) + line + '\n';
			if (line.startsWith('<') && !line.startsWith('</') && !line.startsWith('<?') && !line.endsWith('/>') && !/<[^/][^>]*\/>/.test(line)) indent++;
		}
		return { ok: true, output: formatted.trim() };
	} catch (e) {
		return { ok: false, error: 'XML 格式化失败：' + String(e) };
	}
}

export function minifyXml(xml: string): { ok: true; output: string } | { ok: false; error: string } {
	try {
		const output = xml.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
		return { ok: true, output };
	} catch (e) {
		return { ok: false, error: 'XML 压缩失败：' + String(e) };
	}
}

export function validateXml(xml: string): { ok: true } | { ok: false; error: string } {
	try {
		const parser = new DOMParser();
		const doc = parser.parseFromString(xml, 'text/xml');
		const error = doc.querySelector('parsererror');
		if (error) return { ok: false, error: error.textContent || 'XML 格式无效' };
		return { ok: true };
	} catch (e) {
		return { ok: false, error: String(e) };
	}
}
