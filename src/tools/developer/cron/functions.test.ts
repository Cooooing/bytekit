import { describe, expect, it } from 'vitest';
import { parseCron } from './functions';

describe('Cron 表达式解析', () => {
	it('支持 Unix 5 字段表达式', () => {
		const result = parseCron('*/15 9-18 * * MON-FRI');
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.result.dialect).toBe('Unix 5 字段');
			expect(result.result.description).toContain('每周一至周五');
			expect(result.result.nextRuns.length).toBeGreaterThan(0);
		}
	});

	it('支持 Quartz 6 字段秒字段', () => {
		const result = parseCron('0 0 12 ? * MON');
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.result.dialect).toBe('Quartz/Spring 6 字段');
			expect(result.result.fields[0]?.label).toBe('秒');
		}
	});

	it('拒绝 Quartz 日和星期同时指定具体条件', () => {
		const result = parseCron('0 0 12 1 * MON');
		expect(result.ok).toBe(false);
	});
});
