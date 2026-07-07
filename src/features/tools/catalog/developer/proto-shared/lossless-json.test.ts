import { describe, expect, it } from 'vitest';
import { jsonSampleToProto } from './functions';

describe('JSON 转 Proto 数字精度', () => {
	it('安全整数推断为 int32，大整数推断为 int64', () => {
		const result = jsonSampleToProto('{"safe_id":123,"account_id":2074073104153763841}', {
			rootMessageName: 'RootMessage',
		});

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.result).toContain('int32 safe_id = 1;');
			expect(result.result).toContain('int64 account_id = 2;');
		}
	});
});
