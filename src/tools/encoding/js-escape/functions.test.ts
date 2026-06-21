import { describe, expect, it } from 'vitest';
import { escapeJsString, unescapeJsString } from './functions';

describe('JavaScript 字符串转义', () => {
	it('转义常见控制字符和引号', () => {
		const result = escapeJsString('a\n"b"\\c');
		expect(result).toEqual({ ok: true, output: 'a\\n\\"b\\"\\\\c' });
	});

	it('反转义合法 Unicode 序列', () => {
		expect(unescapeJsString('\\u4f60\\u597d')).toEqual({ ok: true, output: '你好' });
		expect(unescapeJsString('\\u{1F600}')).toEqual({ ok: true, output: '😀' });
	});

	it('保留已转义反斜杠后的 Unicode 字面量', () => {
		expect(unescapeJsString('\\\\uZ')).toEqual({ ok: true, output: '\\uZ' });
		expect(unescapeJsString('\\\\u{1F600}')).toEqual({ ok: true, output: '\\u{1F600}' });
	});

	it('报告非法 Unicode 转义', () => {
		const result = unescapeJsString('\\uZ');
		expect(result.ok).toBe(false);
	});
});
