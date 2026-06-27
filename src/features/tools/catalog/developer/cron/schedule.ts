import type { ParsedCron, ParsedDayOfMonth, ParsedDayOfWeek } from './types';

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

export function getNextRuns(cron: ParsedCron, count: number): string[] {
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
