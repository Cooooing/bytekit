import { describe, expect, it } from 'vitest';
import { formatJson, minifyJson } from './functions';

describe('JSON 格式化', () => {
	it('保持单个 JSON 对象的格式化输出', () => {
		const result = formatJson('{"a":1}');

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.output).toBe('{\n  "a": 1\n}');
		}
	});

	it('格式化多个对象并使用空行分隔', () => {
		const result = formatJson('{"a":1}\n{"b":2}');

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.output).toBe('{\n  "a": 1\n}\n\n{\n  "b": 2\n}');
		}
	});

	it('支持混合顶层 JSON 值', () => {
		const result = formatJson('{"a":1} [2] "x" true null 3');

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.output).toBe('{\n  "a": 1\n}\n\n[\n  2\n]\n\n"x"\n\ntrue\n\nnull\n\n3');
		}
	});

	it('压缩多个 JSON 时保留文档边界', () => {
		const result = minifyJson('{\n  "a": 1\n}\n[2]');

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.output).toBe('{"a":1}\n\n[2]');
		}
	});

	it('不会把字符串中的括号和转义字符误判为文档边界', () => {
		const input = '{"text":"brace } and bracket [","items":[{"value":"quote \\" ok"}]}\n[{"s":"\\\\]"}]';
		const result = formatJson(input);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.output).toBe('{\n  "text": "brace } and bracket [",\n  "items": [\n    {\n      "value": "quote \\" ok"\n    }\n  ]\n}\n\n[\n  {\n    "s": "\\\\]"\n  }\n]');
		}
	});

	it('非法第二个 JSON 返回文档序号', () => {
		const result = formatJson('{"a":1}\n{"b":}');

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toContain('第 2 个 JSON');
		}
	});

	it('拒绝非空白字符分隔的多个 JSON', () => {
		const result = formatJson('{"a":1},{"b":2}');

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toContain('必须使用空白字符分隔');
		}
	});
});
