import { formatCode, minifyCode } from '../shared-formatter';

export function formatXml(xml: string): { ok: true; output: string } | { ok: false; error: string } {
	try {
		return { ok: true, output: formatCode(xml) };
	} catch (e) {
		return { ok: false, error: 'XML 格式化失败：' + String(e) };
	}
}

export function minifyXml(xml: string): { ok: true; output: string } | { ok: false; error: string } {
	try {
		return { ok: true, output: minifyCode(xml) };
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
