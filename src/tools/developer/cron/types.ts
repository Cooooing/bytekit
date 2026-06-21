export const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
export const DAY_NAMES = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
export const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export type CronDialect = 'Unix 5 字段' | 'Quartz/Spring 6 字段' | 'Quartz 7 字段';

export interface FieldSummary {
	label: string;
	value: string;
}

export interface CronResult {
	expression: string;
	dialect: CronDialect;
	description: string;
	nextRuns: string[];
	fields: FieldSummary[];
}

export interface ParsedField {
	raw: string;
	values: number[];
	any: boolean;
	noSpecific: boolean;
}

export interface ParsedDayOfMonth extends ParsedField {
	lastDay: boolean;
	lastWeekday: boolean;
	nearestWeekdays: number[];
}

export interface ParsedDayOfWeek extends ParsedField {
	lastDays: number[];
	nthDays: Array<{ day: number; nth: number }>;
}

export interface ParsedCron {
	dialect: CronDialect;
	seconds: ParsedField;
	minutes: ParsedField;
	hours: ParsedField;
	daysOfMonth: ParsedDayOfMonth;
	months: ParsedField;
	daysOfWeek: ParsedDayOfWeek;
	years: ParsedField;
}
