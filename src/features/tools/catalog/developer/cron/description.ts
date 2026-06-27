import { DAY_NAMES, MONTH_NAMES, WEEKDAY_NAMES, type FieldSummary, type ParsedCron, type ParsedDayOfMonth, type ParsedDayOfWeek, type ParsedField } from './types';

function valueSummary(field: ParsedField, formatter?: (value: number) => string): string {
	if (field.noSpecific) return '不指定';
	if (field.any) return '所有值';
	return field.values.map((value) => formatter ? formatter(value) : String(value)).join(', ');
}

function dayOfMonthSummary(field: ParsedDayOfMonth): string {
	const parts: string[] = [];
	const base = valueSummary(field);
	if (base && base !== '所有值' && base !== '不指定') parts.push(base);
	if (field.any && !field.noSpecific) parts.push('所有日期');
	if (field.noSpecific) parts.push('不指定');
	if (field.lastDay) parts.push('每月最后一天');
	if (field.lastWeekday) parts.push('每月最后一个工作日');
	for (const day of field.nearestWeekdays) parts.push(`每月 ${day} 日最近工作日`);
	return parts.join('；');
}

function dayOfWeekSummary(field: ParsedDayOfWeek): string {
	const parts: string[] = [];
	const base = valueSummary(field, (value) => DAY_NAMES[value] || String(value));
	if (base && base !== '所有值' && base !== '不指定') parts.push(base);
	if (field.any && !field.noSpecific) parts.push('所有星期');
	if (field.noSpecific) parts.push('不指定');
	for (const day of field.lastDays) parts.push(`每月最后一个${DAY_NAMES[day]}`);
	for (const item of field.nthDays) parts.push(`每月第 ${item.nth} 个${DAY_NAMES[item.day]}`);
	return parts.join('；');
}

function formatNumberList(values: number[], suffix = ''): string {
	return values.map((value) => `${value}${suffix}`).join('、');
}

function formatNameList(values: number[], formatter: (value: number) => string): string {
	return values.map(formatter).join('、');
}

function isSingleValue(field: ParsedField): boolean {
	return !field.any && !field.noSpecific && field.values.length === 1;
}

function isWeekdays(field: ParsedDayOfWeek): boolean {
	return !field.any
		&& !field.noSpecific
		&& field.lastDays.length === 0
		&& field.nthDays.length === 0
		&& field.values.length === 5
		&& [1, 2, 3, 4, 5].every((day) => field.values.includes(day));
}

function formatTime(cron: ParsedCron): string {
	const hasSingleTime = isSingleValue(cron.hours) && isSingleValue(cron.minutes) && isSingleValue(cron.seconds);
	if (!hasSingleTime) return '匹配的时间';

	const hour = String(cron.hours.values[0]).padStart(2, '0');
	const minute = String(cron.minutes.values[0]).padStart(2, '0');
	if (cron.dialect === 'Unix 5 字段') return `${hour}:${minute}`;

	const second = String(cron.seconds.values[0]).padStart(2, '0');
	return `${hour}:${minute}:${second}`;
}

function formatDayOfMonthConstraint(field: ParsedDayOfMonth): string | null {
	if (field.noSpecific) return null;

	const parts: string[] = [];
	if (!field.any && field.values.length > 0) parts.push(`每月 ${formatNumberList(field.values, ' 日')}`);
	if (field.lastDay) parts.push('每月最后一天');
	if (field.lastWeekday) parts.push('每月最后一个工作日');
	for (const day of field.nearestWeekdays) parts.push(`每月 ${day} 日最近的工作日`);

	if (parts.length === 0) return null;
	return parts.join('，');
}

function formatDayOfWeekConstraint(field: ParsedDayOfWeek): string | null {
	if (field.noSpecific) return null;
	if (isWeekdays(field)) return '每周一至周五';

	const parts: string[] = [];
	if (!field.any && field.values.length > 0) {
		parts.push(`每周${formatNameList(field.values, (value) => WEEKDAY_NAMES[value] || String(value))}`);
	}
	for (const day of field.lastDays) parts.push(`每月最后一个${WEEKDAY_NAMES[day]}`);
	for (const item of field.nthDays) parts.push(`每月第 ${item.nth} 个${WEEKDAY_NAMES[item.day]}`);

	if (parts.length === 0) return null;
	return parts.join('，');
}

function formatMonthConstraint(field: ParsedField): string | null {
	if (field.any) return null;
	return `仅在${formatNameList(field.values, (value) => MONTH_NAMES[value - 1] || String(value))}执行`;
}

function formatYearConstraint(field: ParsedField): string | null {
	if (field.any) return null;
	return `仅在 ${formatNumberList(field.values, ' 年')}执行`;
}

export function buildDescription(cron: ParsedCron): string {
	const time = formatTime(cron);
	const dayOfMonth = formatDayOfMonthConstraint(cron.daysOfMonth);
	const dayOfWeek = formatDayOfWeekConstraint(cron.daysOfWeek);
	const dateRule = [dayOfMonth, dayOfWeek].filter(Boolean).join('，') || '每天';
	const restrictions = [formatMonthConstraint(cron.months), formatYearConstraint(cron.years)].filter(Boolean);
	const restrictionText = restrictions.length > 0 ? `，${restrictions.join('，')}` : '';

	return `${dateRule} ${time} 执行${restrictionText}。`;
}

export function buildFieldSummary(cron: ParsedCron): FieldSummary[] {
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
