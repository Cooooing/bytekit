import { describe, expect, it } from 'vitest';
import { testRegex } from './functions';

describe('正则测试', () => {
	it('返回匹配和捕获组', () => {
		const result = testRegex('(foo)(\\d+)', 'g', 'foo12 bar foo34');
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.count).toBe(2);
			expect(result.matches[0]?.groups).toEqual(['foo', '12']);
		}
	});

	it('限制匹配结果数量', () => {
		const result = testRegex('a', 'g', 'a'.repeat(1200));
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.count).toBe(1000);
			expect(result.truncated).toBe(true);
		}
	});

	it('拒绝超长输入', () => {
		const result = testRegex('a', 'g', 'a'.repeat(100001));
		expect(result.ok).toBe(false);
	});
});
