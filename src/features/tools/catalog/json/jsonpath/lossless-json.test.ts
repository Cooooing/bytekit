import { describe, expect, it } from 'vitest';
import { stringifyJsonLossless } from '../../../shared/losslessJson';
import { evaluateJsonPath } from './functions';

describe('JSONPath 数字精度', () => {
	it('查询大整数时保留原始数字字面量', () => {
		const result = evaluateJsonPath('{"account_id":2074073104153763841}', '$.account_id');

		expect(result.ok).toBe(true);
		if (result.ok) {
			const output = stringifyJsonLossless(result.results, 2);
			expect(output).toContain('2074073104153763841');
			expect(output).not.toContain('2074073104153763800');
		}
	});
});
