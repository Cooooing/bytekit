import { describe, expect, it } from 'vitest';
import { parseCron } from './functions';
import { parseCronFields } from './parser';

describe('Cron 表达式解析', () => {
	it('支持 Unix 5 字段表达式和 Unix 星期数字', () => {
		const result = parseCron('*/15 9-18 * * MON-FRI');
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.result.dialect).toBe('Unix 5 字段');
			expect(result.result.description).toContain('每周一至周五');
			expect(result.result.nextRuns.length).toBeGreaterThan(0);
		}

		const monday = parseCronFields('0 9 * * 1');
		expect(monday.ok).toBe(true);
		if (monday.ok) {
			expect(monday.cron.dialect).toBe('Unix 5 字段');
			expect(monday.cron.daysOfWeek.values).toEqual([1]);
		}
	});

	it('支持 Spring 6 字段秒字段和 Spring 星期数字', () => {
		const result = parseCron('0 0 12 ? * MON');
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.result.dialect).toBe('Spring 6 字段');
			expect(result.result.fields[0]?.label).toBe('秒');
		}

		const monday = parseCronFields('0 0 12 ? * 1');
		expect(monday.ok).toBe(true);
		if (monday.ok) {
			expect(monday.cron.dialect).toBe('Spring 6 字段');
			expect(monday.cron.daysOfWeek.values).toEqual([1]);
		}
	});

	it('支持 Quartz 7 字段表达式和 Quartz 星期数字', () => {
		const result = parseCronFields('0 0 12 ? * 2 2099');
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.cron.dialect).toBe('Quartz 7 字段');
			expect(result.cron.daysOfWeek.values).toEqual([1]);
			expect(result.cron.years.values).toEqual([2099]);
		}

		const weekdayRange = parseCronFields('0 0 9 ? * 2-6 *');
		expect(weekdayRange.ok).toBe(true);
		if (weekdayRange.ok) {
			expect(weekdayRange.cron.daysOfWeek.values).toEqual([1, 2, 3, 4, 5]);
		}

		const specialDays = parseCronFields('0 0 9 ? * 2#1,6L *');
		expect(specialDays.ok).toBe(true);
		if (specialDays.ok) {
			expect(specialDays.cron.daysOfWeek.nthDays).toEqual([{ day: 1, nth: 1 }]);
			expect(specialDays.cron.daysOfWeek.lastDays).toEqual([5]);
		}

		const invalidZero = parseCronFields('0 0 9 ? * 0 *');
		expect(invalidZero.ok).toBe(false);
	});

	it('拒绝 Quartz 日和星期同时指定具体条件', () => {
		const result = parseCron('0 0 12 1 * MON');
		expect(result.ok).toBe(false);
	});

	it('支持各字段从指定起点开始的步进语法', () => {
		const result = parseCronFields('0/20 5/15 9/3 * JAN/3 ?');
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.cron.seconds.values).toEqual([0, 20, 40]);
			expect(result.cron.minutes.values).toEqual([5, 20, 35, 50]);
			expect(result.cron.hours.values).toEqual([9, 12, 15, 18, 21]);
			expect(result.cron.months.values).toEqual([1, 4, 7, 10]);
		}
	});
});
