import { formatCode, minifyCode } from '../shared-formatter';

export function formatHtml(html: string): { ok: true; output: string } | { ok: false; error: string } {
	try {
		return { ok: true, output: formatCode(html) };
	} catch (e) {
		return { ok: false, error: 'HTML 格式化失败：' + String(e) };
	}
}

export function minifyHtml(html: string): { ok: true; output: string } | { ok: false; error: string } {
	try {
		return { ok: true, output: minifyCode(html) };
	} catch (e) {
		return { ok: false, error: 'HTML 压缩失败：' + String(e) };
	}
}
