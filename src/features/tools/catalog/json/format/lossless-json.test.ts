import { describe, expect, it } from 'vitest';
import { formatJson, minifyJson } from './functions';

describe('JSON 数字精度', () => {
	it('格式化时保留超出 JavaScript 安全范围的数字', () => {
		const result = formatJson('{"account_id":2074073104153763841,"ratio":1.234567890123456789}');

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.output).toContain('"account_id": 2074073104153763841');
			expect(result.output).toContain('"ratio": 1.234567890123456789');
			expect(result.output).not.toContain('2074073104153763800');
		}
	});

	it('压缩时保留超出 JavaScript 安全范围的数字', () => {
		const result = minifyJson('{"account_id":2074073104153763841}');

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.output).toBe('{"account_id":2074073104153763841}');
		}
	});
});
