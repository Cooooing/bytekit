import { formatCode, minifyCode } from '../shared-formatter';

export function formatHtml(html: string): { ok: true; output: string } | { ok: false; error: string } {
	const trimmed = html.trim();
	if (!trimmed) return { ok: false, error: '请输入 HTML 代码。' };

	try {
		return { ok: true, output: formatCode(trimmed, { mode: 'html' }) };
	} catch (e) {
		return { ok: false, error: 'HTML 格式化失败：' + String(e) };
	}
}

export function minifyHtml(html: string): { ok: true; output: string } | { ok: false; error: string } {
	const trimmed = html.trim();
	if (!trimmed) return { ok: false, error: '请输入 HTML 代码。' };

	try {
		return { ok: true, output: minifyCode(trimmed) };
	} catch (e) {
		return { ok: false, error: 'HTML 压缩失败：' + String(e) };
	}
}
