import { formatCode, minifyCode } from '../shared-formatter';
import { fail, ok } from '../result';

export function formatXml(xml: string): { ok: true; output: string } | { ok: false; error: string } {
	const validation = validateXml(xml);
	if (!validation.ok) return validation;
	try {
		return ok(formatCode(xml.trim(), { mode: 'xml' }));
	} catch (e) {
		return fail('XML 格式化失败：' + String(e));
	}
}

export function minifyXml(xml: string): { ok: true; output: string } | { ok: false; error: string } {
	const validation = validateXml(xml);
	if (!validation.ok) return validation;
	try {
		return ok(minifyCode(xml));
	} catch (e) {
		return fail('XML 压缩失败：' + String(e));
	}
}

export function validateXml(xml: string): { ok: true } | { ok: false; error: string } {
	try {
		if (!xml.trim()) return fail('请输入 XML 内容。');
		if (typeof DOMParser === 'undefined') return { ok: true };
		const parser = new DOMParser();
		const doc = parser.parseFromString(xml, 'text/xml');
		const error = doc.querySelector('parsererror');
		if (error) return fail(normalizeXmlError(error.textContent || ''));
		return { ok: true };
	} catch (e) {
		return fail('XML 校验失败：' + String(e));
	}
}

function normalizeXmlError(message: string): string {
	const lower = message.toLowerCase();
	if (lower.includes('opening and ending tag mismatch')) return 'XML 标签嵌套不匹配，请检查开始标签和结束标签。';
	if (lower.includes('attributes construct error')) return 'XML 属性格式不正确，请检查属性名和值。';
	if (lower.includes('entityref') || lower.includes('entity')) return 'XML 包含未转义字符，请检查 & 等特殊字符。';
	if (lower.includes('parsererror')) return 'XML 格式无效，请检查标签闭合和嵌套关系。';
	return 'XML 格式无效，请检查标签闭合和嵌套关系。';
}
