import type { ParsedCron, ParsedDayOfMonth, ParsedDayOfWeek, ParsedField, CronDialect } from './types';

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

function parseField(field: string, min: number, max: number, label: string, aliases?: Record<string, number>, allowNoSpecific = false): { ok: true; field: ParsedField } | { ok: false; error: string } {
	const values: number[] = [];
	let any = false;
	let noSpecific = false;

	for (const part of field.split(',')) {
		const token = part.trim();
		if (!token) return { ok: false, error: `${label}字段存在空片段。` };
		if (token === '*' || token === '?') {
			if (token === '?' && !allowNoSpecific) return { ok: false, error: `${label}字段不支持 ?。` };
			if (token === '?') noSpecific = true;
			any = true;
			for (let value = min; value <= max; value++) values.push(value);
			continue;
		}

		const [rangeToken, stepToken, extra] = token.split('/');
		if (extra !== undefined) return { ok: false, error: `${label}字段 "${token}" 的步进语法无效。` };
		const step = stepToken === undefined ? 1 : Number(stepToken);
		if (!Number.isInteger(step) || step <= 0) return { ok: false, error: `${label}字段 "${token}" 的步进必须为正整数。` };

		const rangeValues = expandRange(rangeToken, min, max, label, aliases);
		if (!rangeValues.ok) return rangeValues;
		for (let value = rangeValues.start; value <= rangeValues.end; value += step) values.push(value);
	}

	const normalizedValues = unique(values.map((value) => min === 0 && max === 7 ? normalizeDayOfWeek(value) : value));
	if (normalizedValues.length === 0) return { ok: false, error: `${label}字段 "${field}" 没有可用值。` };
	return { ok: true, field: { raw: field, values: normalizedValues, any, noSpecific } };
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

export function parseCronFields(expression: string): { ok: true; cron: ParsedCron } | { ok: false; error: string } {
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

	const seconds = parseField(secondsRaw, 0, 59, '秒');
	const minutes = parseField(minuteRaw, 0, 59, '分钟');
	const hours = parseField(hourRaw, 0, 23, '小时');
	const allowNoSpecific = dialect !== 'Unix 5 字段';
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
