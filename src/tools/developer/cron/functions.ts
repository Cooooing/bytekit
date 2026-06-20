const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
const DAY_NAMES = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

const MONTH_ALIASES: Record<string, number> = {
	JAN: 1,
	FEB: 2,
	MAR: 3,
	APR: 4,
	MAY: 5,
	JUN: 6,
	JUL: 7,
	AUG: 8,
	SEP: 9,
	OCT: 10,
	NOV: 11,
	DEC: 12,
};

const DAY_ALIASES: Record<string, number> = {
	SUN: 0,
	MON: 1,
	TUE: 2,
	WED: 3,
	THU: 4,
	FRI: 5,
	SAT: 6,
};

type CronDialect = 'Unix 5 字段' | 'Quartz/Spring 6 字段' | 'Quartz 7 字段';

interface FieldSummary {
	label: string;
	value: string;
}

interface CronResult {
	expression: string;
	dialect: CronDialect;
	description: string;
	nextRuns: string[];
	fields: FieldSummary[];
}

interface ParsedField {
	raw: string;
	values: number[];
	any: boolean;
	noSpecific: boolean;
}

interface ParsedDayOfMonth extends ParsedField {
	lastDay: boolean;
	lastWeekday: boolean;
	nearestWeekdays: number[];
}

interface ParsedDayOfWeek extends ParsedField {
	lastDays: number[];
	nthDays: Array<{ day: number; nth: number }>;
}

interface ParsedCron {
	dialect: CronDialect;
	seconds: ParsedField;
	minutes: ParsedField;
	hours: ParsedField;
	daysOfMonth: ParsedDayOfMonth;
	months: ParsedField;
	daysOfWeek: ParsedDayOfWeek;
	years: ParsedField;
}

function unique(values: number[]): number[] {
	return [...new Set(values)].sort((a, b) => a - b);
}

function valueFromToken(token: string, aliases?: Record<string, number>): number | null {
	const normalized = token.trim().toUpperCase();
	if (aliases && normalized in aliases) return aliases[normalized];
	const parsed = Number(normalized);
	return Number.isInteger(parsed) ? parsed : null;
}

function normalizeDayOfWeek(value: number): number {
	return value === 7 ? 0 : value;
}

function parseField(field: string, min: number, max: number, label: string, aliases?: Record<string, number>, allowNoSpecific = false): { ok: true; field: ParsedField } | { ok: false; error: string } {
	const values: number[] = [];
	let any = false;
	let noSpecific = false;
	const parts = field.split(',');

	for (const part of parts) {
		const token = part.trim();
		if (!token) return { ok: false, error: `${label}字段存在空片段。` };
		if (token === '*' || token === '?') {
			if (token === '?' && !allowNoSpecific) return { ok: false, error: `${label}字段不支持 ?。` };
			if (token === '?') noSpecific = true;
			any = true;
			for (let i = min; i <= max; i++) values.push(i);
			continue;
		}

		const [rangeToken, stepToken, extra] = token.split('/');
		if (extra !== undefined) return { ok: false, error: `${label}字段 "${token}" 的步进语法无效。` };
		const step = stepToken === undefined ? 1 : Number(stepToken);
		if (!Number.isInteger(step) || step <= 0) return { ok: false, error: `${label}字段 "${token}" 的步进必须为正整数。` };

		const rangeValues = expandRange(rangeToken, min, max, label, aliases);
		if (!rangeValues.ok) return rangeValues;
		for (let i = rangeValues.start; i <= rangeValues.end; i += step) values.push(i);
	}

	const normalizedValues = unique(values.map((value) => min === 0 && max === 7 ? normalizeDayOfWeek(value) : value));
	if (normalizedValues.length === 0) return { ok: false, error: `${label}字段 "${field}" 没有可用值。` };
	return { ok: true, field: { raw: field, values: normalizedValues, any, noSpecific } };
}

function expandRange(range: string, min: number, max: number, label: string, aliases?: Record<string, number>): { ok: true; start: number; end: number } | { ok: false; error: string } {
	if (range === '*') return { ok: true, start: min, end: max };
	if (range === '?') return { ok: false, error: `${label}字段的 ? 不能和步进语法组合使用。` };
	if (range.includes('-')) {
		const [startToken, endToken, extra] = range.split('-');
		if (extra !== undefined) return { ok: false, error: `${label}字段 "${range}" 的范围语法无效。` };
		const start = valueFromToken(startToken, aliases);
		const end = valueFromToken(endToken, aliases);
		if (start === null || end === null) return { ok: false, error: `${label}字段 "${range}" 包含无效值。` };
		const lo = Math.min(start, end);
		const hi = Math.max(start, end);
		if (lo < min || hi > max) return { ok: false, error: `${label}字段 "${range}" 超出范围 ${min}-${max}。` };
		return { ok: true, start: lo, end: hi };
	}
	const value = valueFromToken(range, aliases);
	if (value === null || value < min || value > max) return { ok: false, error: `${label}字段 "${range}" 超出范围 ${min}-${max}。` };
	return { ok: true, start: value, end: value };
}

function parseDayOfMonth(field: string, allowNoSpecific: boolean): { ok: true; field: ParsedDayOfMonth } | { ok: false; error: string } {
	const values: number[] = [];
	const nearestWeekdays: number[] = [];
	let any = false;
	let noSpecific = false;
	let lastDay = false;
	let lastWeekday = false;

	for (const part of field.split(',')) {
		const token = part.trim().toUpperCase();
		if (token === 'L') {
			lastDay = true;
			continue;
		}
		if (token === 'LW') {
			lastWeekday = true;
			continue;
		}
		const weekdayMatch = token.match(/^(\d{1,2})W$/);
		if (weekdayMatch) {
			const day = Number(weekdayMatch[1]);
			if (day < 1 || day > 31) return { ok: false, error: `日字段 "${part}" 超出范围 1-31。` };
			nearestWeekdays.push(day);
			continue;
		}
		const parsed = parseField(token, 1, 31, '日', undefined, allowNoSpecific);
		if (!parsed.ok) return parsed;
		values.push(...parsed.field.values);
		any = any || parsed.field.any;
		noSpecific = noSpecific || parsed.field.noSpecific;
	}

	if (!lastDay && !lastWeekday && nearestWeekdays.length === 0 && values.length === 0) return { ok: false, error: `日字段 "${field}" 没有可用值。` };
	return { ok: true, field: { raw: field, values: unique(values), any, noSpecific, lastDay, lastWeekday, nearestWeekdays: unique(nearestWeekdays) } };
}

function parseDayOfWeek(field: string, allowNoSpecific: boolean): { ok: true; field: ParsedDayOfWeek } | { ok: false; error: string } {
	const values: number[] = [];
	const lastDays: number[] = [];
	const nthDays: Array<{ day: number; nth: number }> = [];
	let any = false;
	let noSpecific = false;

	for (const part of field.split(',')) {
		const token = part.trim().toUpperCase();
		const lastMatch = token.match(/^([A-Z]{3}|[0-7])L$/);
		if (lastMatch) {
			const day = valueFromToken(lastMatch[1], DAY_ALIASES);
			if (day === null || day < 0 || day > 7) return { ok: false, error: `星期字段 "${part}" 无效。` };
			lastDays.push(normalizeDayOfWeek(day));
			continue;
		}
		const nthMatch = token.match(/^([A-Z]{3}|[0-7])#([1-5])$/);
		if (nthMatch) {
			const day = valueFromToken(nthMatch[1], DAY_ALIASES);
			const nth = Number(nthMatch[2]);
			if (day === null || day < 0 || day > 7) return { ok: false, error: `星期字段 "${part}" 无效。` };
			nthDays.push({ day: normalizeDayOfWeek(day), nth });
			continue;
		}
		const parsed = parseField(token, 0, 7, '星期', DAY_ALIASES, allowNoSpecific);
		if (!parsed.ok) return parsed;
		values.push(...parsed.field.values.map(normalizeDayOfWeek));
		any = any || parsed.field.any;
		noSpecific = noSpecific || parsed.field.noSpecific;
	}

	if (lastDays.length === 0 && nthDays.length === 0 && values.length === 0) return { ok: false, error: `星期字段 "${field}" 没有可用值。` };
	return { ok: true, field: { raw: field, values: unique(values), any, noSpecific, lastDays: unique(lastDays), nthDays } };
}

function hasConcreteDayOfMonth(field: ParsedDayOfMonth): boolean {
	return !field.noSpecific && (!field.any || field.lastDay || field.lastWeekday || field.nearestWeekdays.length > 0);
}

function hasConcreteDayOfWeek(field: ParsedDayOfWeek): boolean {
	return !field.noSpecific && (!field.any || field.lastDays.length > 0 || field.nthDays.length > 0);
}

function parseCronFields(expression: string): { ok: true; cron: ParsedCron } | { ok: false; error: string } {
	const parts = expression.trim().split(/\s+/);
	const nowYear = new Date().getFullYear();
	let dialect: CronDialect;
	let secondsRaw = '0';
	let minuteRaw: string;
	let hourRaw: string;
	let dayOfMonthRaw: string;
	let monthRaw: string;
	let dayOfWeekRaw: string;
	let yearRaw = '*';

	if (parts.length === 5) {
		dialect = 'Unix 5 字段';
		[minuteRaw, hourRaw, dayOfMonthRaw, monthRaw, dayOfWeekRaw] = parts;
	} else if (parts.length === 6) {
		dialect = 'Quartz/Spring 6 字段';
		[secondsRaw, minuteRaw, hourRaw, dayOfMonthRaw, monthRaw, dayOfWeekRaw] = parts;
	} else if (parts.length === 7) {
		dialect = 'Quartz 7 字段';
		[secondsRaw, minuteRaw, hourRaw, dayOfMonthRaw, monthRaw, dayOfWeekRaw, yearRaw] = parts;
	} else {
		return { ok: false, error: 'Cron 表达式必须包含 5、6 或 7 个字段。' };
	}

	const allowNoSpecific = dialect !== 'Unix 5 字段';
	const seconds = parseField(secondsRaw, 0, 59, '秒');
	const minutes = parseField(minuteRaw, 0, 59, '分钟');
	const hours = parseField(hourRaw, 0, 23, '小时');
	const daysOfMonth = parseDayOfMonth(dayOfMonthRaw, allowNoSpecific);
	const months = parseField(monthRaw, 1, 12, '月', MONTH_ALIASES);
	const daysOfWeek = parseDayOfWeek(dayOfWeekRaw, allowNoSpecific);
	const years = parseField(yearRaw, 1970, nowYear + 10, '年');

	if (!seconds.ok) return seconds;
	if (!minutes.ok) return minutes;
	if (!hours.ok) return hours;
	if (!daysOfMonth.ok) return daysOfMonth;
	if (!months.ok) return months;
	if (!daysOfWeek.ok) return daysOfWeek;
	if (!years.ok) return years;

	if (allowNoSpecific && hasConcreteDayOfMonth(daysOfMonth.field) && hasConcreteDayOfWeek(daysOfWeek.field)) {
		return { ok: false, error: 'Quartz/Spring Cron 的日字段和星期字段不能同时指定具体条件，请将其中一个字段设置为 ?。' };
	}

	return {
		ok: true,
		cron: {
			dialect,
			seconds: seconds.field,
			minutes: minutes.field,
			hours: hours.field,
			daysOfMonth: daysOfMonth.field,
			months: months.field,
			daysOfWeek: daysOfWeek.field,
			years: years.field,
		},
	};
}

function daysInMonth(year: number, month: number): number {
	return new Date(year, month, 0).getDate();
}

function nearestWeekday(year: number, month: number, day: number): number {
	const maxDay = daysInMonth(year, month);
	const target = Math.min(day, maxDay);
	const date = new Date(year, month - 1, target);
	const weekday = date.getDay();
	if (weekday === 6) return target === 1 ? 3 : target - 1;
	if (weekday === 0) return target === maxDay ? target - 2 : target + 1;
	return target;
}

function lastWeekday(year: number, month: number): number {
	const maxDay = daysInMonth(year, month);
	for (let day = maxDay; day >= maxDay - 6; day--) {
		const weekday = new Date(year, month - 1, day).getDay();
		if (weekday >= 1 && weekday <= 5) return day;
	}
	return maxDay;
}

function nthWeekdayOfMonth(year: number, month: number, targetDay: number, nth: number): number | null {
	let count = 0;
	for (let day = 1; day <= daysInMonth(year, month); day++) {
		if (new Date(year, month - 1, day).getDay() === targetDay) {
			count++;
			if (count === nth) return day;
		}
	}
	return null;
}

function isLastWeekdayOfMonth(date: Date, targetDay: number): boolean {
	if (date.getDay() !== targetDay) return false;
	const nextWeek = new Date(date);
	nextWeek.setDate(date.getDate() + 7);
	return nextWeek.getMonth() !== date.getMonth();
}

function matchDayOfMonth(date: Date, field: ParsedDayOfMonth): boolean | null {
	if (field.noSpecific) return null;
	if (field.any) return true;
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	if (field.values.includes(day)) return true;
	if (field.lastDay && day === daysInMonth(year, month)) return true;
	if (field.lastWeekday && day === lastWeekday(year, month)) return true;
	return field.nearestWeekdays.some((target) => day === nearestWeekday(year, month, target));
}

function matchDayOfWeek(date: Date, field: ParsedDayOfWeek): boolean | null {
	if (field.noSpecific) return null;
	if (field.any) return true;
	const day = date.getDay();
	if (field.values.includes(day)) return true;
	if (field.lastDays.some((target) => isLastWeekdayOfMonth(date, target))) return true;
	return field.nthDays.some((item) => date.getDate() === nthWeekdayOfMonth(date.getFullYear(), date.getMonth() + 1, item.day, item.nth));
}

function matchDate(date: Date, cron: ParsedCron): boolean {
	if (!cron.years.values.includes(date.getFullYear())) return false;
	if (!cron.months.values.includes(date.getMonth() + 1)) return false;

	const dom = matchDayOfMonth(date, cron.daysOfMonth);
	const dow = matchDayOfWeek(date, cron.daysOfWeek);
	if (dom === null && dow === null) return true;
	if (dom === null) return dow === true;
	if (dow === null) return dom === true;
	if (cron.daysOfMonth.any && cron.daysOfWeek.any) return true;
	return dom || dow;
}

function getNextRuns(cron: ParsedCron, count: number): string[] {
	const runs: string[] = [];
	const now = new Date();
	const cursor = new Date(now);
	cursor.setMilliseconds(0);
	cursor.setSeconds(cursor.getSeconds() + 1);
	const end = new Date(now);
	end.setFullYear(end.getFullYear() + 5);

	const dayCursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
	while (runs.length < count && dayCursor <= end) {
		if (matchDate(dayCursor, cron)) {
			for (const hour of cron.hours.values) {
				for (const minute of cron.minutes.values) {
					for (const second of cron.seconds.values) {
						const candidate = new Date(dayCursor.getFullYear(), dayCursor.getMonth(), dayCursor.getDate(), hour, minute, second);
						if (candidate >= cursor && candidate <= end) {
							runs.push(candidate.toLocaleString('zh-CN', {
								year: 'numeric',
								month: '2-digit',
								day: '2-digit',
								hour: '2-digit',
								minute: '2-digit',
								second: '2-digit',
							}));
							if (runs.length >= count) return runs;
						}
					}
				}
			}
		}
		dayCursor.setDate(dayCursor.getDate() + 1);
	}
	return runs;
}

function valueSummary(field: ParsedField, formatter?: (value: number) => string): string {
	if (field.noSpecific) return '不指定';
	if (field.any) return '所有值';
	return field.values.map((value) => formatter ? formatter(value) : String(value)).join(', ');
}

function dayOfMonthSummary(field: ParsedDayOfMonth): string {
	const parts: string[] = [];
	const base = valueSummary(field);
	if (base !== '所有值' && base !== '不指定') parts.push(base);
	if (field.any) parts.push('所有日期');
	if (field.noSpecific) parts.push('不指定');
	if (field.lastDay) parts.push('每月最后一天');
	if (field.lastWeekday) parts.push('每月最后一个工作日');
	for (const day of field.nearestWeekdays) parts.push(`每月 ${day} 日最近工作日`);
	return parts.join('；');
}

function dayOfWeekSummary(field: ParsedDayOfWeek): string {
	const parts: string[] = [];
	const base = valueSummary(field, (value) => DAY_NAMES[value] || String(value));
	if (base !== '所有值' && base !== '不指定') parts.push(base);
	if (field.any) parts.push('所有星期');
	if (field.noSpecific) parts.push('不指定');
	for (const day of field.lastDays) parts.push(`每月最后一个${DAY_NAMES[day]}`);
	for (const item of field.nthDays) parts.push(`每月第 ${item.nth} 个${DAY_NAMES[item.day]}`);
	return parts.join('；');
}

function buildDescription(cron: ParsedCron): string {
	const timePrefix = cron.dialect === 'Unix 5 字段'
		? `${cron.hours.raw}:${cron.minutes.raw.padStart(2, '0')}`
		: `${cron.hours.raw}:${cron.minutes.raw.padStart(2, '0')}:${cron.seconds.raw.padStart(2, '0')}`;
	const parts = [timePrefix];
	if (!cron.daysOfMonth.any && !cron.daysOfMonth.noSpecific) parts.push(dayOfMonthSummary(cron.daysOfMonth));
	if (!cron.months.any) parts.push(valueSummary(cron.months, (value) => MONTH_NAMES[value - 1] || String(value)));
	if (!cron.daysOfWeek.any && !cron.daysOfWeek.noSpecific) parts.push(dayOfWeekSummary(cron.daysOfWeek));
	if (!cron.years.any) parts.push(`${cron.years.values.join(', ')} 年`);
	return parts.filter(Boolean).join('，');
}

function buildFieldSummary(cron: ParsedCron): FieldSummary[] {
	const fields: FieldSummary[] = [];
	if (cron.dialect !== 'Unix 5 字段') fields.push({ label: '秒', value: valueSummary(cron.seconds) });
	fields.push(
		{ label: '分钟', value: valueSummary(cron.minutes) },
		{ label: '小时', value: valueSummary(cron.hours) },
		{ label: '日', value: dayOfMonthSummary(cron.daysOfMonth) },
		{ label: '月', value: valueSummary(cron.months, (value) => MONTH_NAMES[value - 1] || String(value)) },
		{ label: '星期', value: dayOfWeekSummary(cron.daysOfWeek) },
	);
	if (cron.dialect === 'Quartz 7 字段') fields.push({ label: '年', value: valueSummary(cron.years) });
	return fields;
}

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

export { MONTH_NAMES, DAY_NAMES };
export type { CronResult };
