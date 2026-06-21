import { buildDescription, buildFieldSummary } from './description';
import { parseCronFields } from './parser';
import { getNextRuns } from './schedule';
import type { CronResult } from './types';

export function parseCron(expression: string): { ok: true; result: CronResult } | { ok: false; error: string } {
	if (!expression.trim()) return { ok: false, error: '请输入 Cron 表达式。' };
	const parsed = parseCronFields(expression);
	if (!parsed.ok) return parsed;

	const nextRuns = getNextRuns(parsed.cron, 5);
	if (nextRuns.length === 0) {
		return { ok: false, error: '未来 5 年内没有匹配的执行时间，请检查日、月、星期和年字段组合。' };
	}

	return {
		ok: true,
		result: {
			expression: expression.trim(),
			dialect: parsed.cron.dialect,
			description: buildDescription(parsed.cron),
			nextRuns,
			fields: buildFieldSummary(parsed.cron),
		},
	};
}

export { DAY_NAMES, MONTH_NAMES } from './types';
export type { CronResult } from './types';
