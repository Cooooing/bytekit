import { formatCode, minifyCode } from '../shared-formatter';
import { fail, ok, requireTrimmedInput } from '../result';

export function formatHtml(html: string): { ok: true; output: string } | { ok: false; error: string } {
	const trimmed = html.trim();
	if (!trimmed) return fail('请输入 HTML 代码。');

	try {
		return ok(formatCode(trimmed, { mode: 'html' }));
	} catch (e) {
		return fail('HTML 格式化失败：' + String(e));
	}
}

export function minifyHtml(html: string): { ok: true; output: string } | { ok: false; error: string } {
	const trimmed = requireTrimmedInput(html, '请输入 HTML 代码。');
	if (typeof trimmed !== 'string') return trimmed;

	try {
		return ok(minifyCode(trimmed));
	} catch (e) {
		return fail('HTML 压缩失败：' + String(e));
	}
}
