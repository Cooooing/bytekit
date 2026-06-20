const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
const DAY_NAMES = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

interface CronResult {
	expression: string;
	description: string;
	nextRuns: string[];
	fields: {
		minutes: number[];
		hours: number[];
		daysOfMonth: number[];
		months: number[];
		daysOfWeek: number[];
	};
}

function parseField(field: string, min: number, max: number): number[] {
	const values: number[] = [];
	const parts = field.split(',');
	for (const part of parts) {
		if (part === '*' || part === '?') {
			for (let i = min; i <= max; i++) values.push(i);
		} else if (part.includes('/')) {
			const [start, step] = part.split('/');
			const s = (start === '*' || start === '?') ? min : parseInt(start, 10);
			const st = parseInt(step, 10);
			if (isNaN(s) || isNaN(st) || st <= 0) continue;
			for (let i = s; i <= max; i += st) values.push(i);
		} else if (part.includes('-')) {
			const [a, b] = part.split('-').map(Number);
			if (isNaN(a) || isNaN(b)) continue;
			const lo = Math.min(a, b), hi = Math.max(a, b);
			for (let i = lo; i <= hi; i++) values.push(i);
		} else {
			const v = parseInt(part, 10);
			if (!isNaN(v)) values.push(v);
		}
	}
	return [...new Set(values)].sort((a, b) => a - b);
}

function expandField(field: string, min: number, max: number): number[] {
	return parseField(field, min, max);
}

function buildDescription(minute: string, hour: string, dayOfMonth: string, month: string, dayOfWeek: string): string {
	const desc: string[] = [];

	// Handle hour ranges like 9-17
	const hourParts = hour.split(',');
	const isFullHourRange = hourParts.length === 1 && hour.includes('-');
	if (isFullHourRange) {
		const [startH, endH] = hour.split('-').map(Number);
		if (minute === '0') {
			desc.push(`${startH}:00 至 ${endH}:00 每整点`);
		} else {
			desc.push(`${startH}:00 至 ${endH}:00 每小时的第 ${minute} 分钟`);
		}
	} else if (minute === '*' && hour === '*') {
		desc.push('每分钟');
	} else if (minute === '0' && hour === '*') {
		desc.push('每小时的第 0 分钟');
	} else if (minute !== '*' && hour === '*') {
		desc.push(`每小时的第 ${minute} 分钟`);
	} else if (minute.includes('-') && hour === '*') {
		desc.push(`每小时的第 ${minute} 分钟`);
	} else if (minute === '*' && !isFullHourRange) {
		desc.push(`每小时`);
	} else if (minute === '0' && !isFullHourRange) {
		desc.push(`每整点`);
	} else if (!isFullHourRange) {
		desc.push(`${hour}:${minute.padStart(2, '0')}`);
	}

	if (dayOfMonth !== '*') desc.push(`每月 ${dayOfMonth} 日`);
	if (month !== '*') {
		const months = expandField(month, 1, 12);
		desc.push(months.map(m => MONTH_NAMES[m - 1] || String(m)).join('、'));
	}
	if (dayOfWeek !== '*') {
		const days = expandField(dayOfWeek, 0, 7).map(d => d === 7 ? 0 : d);
		const unique = [...new Set(days)].sort((a, b) => a - b);
		if (unique.length >= 5 && unique[0] === 1 && unique[unique.length - 1] === 5) {
			desc.push('工作日（周一至周五）');
		} else {
			desc.push(unique.map(d => DAY_NAMES[d] || String(d)).join('、'));
		}
	}

	return desc.join('，');
}

function getNextRuns(
	minutes: number[],
	hours: number[],
	daysOfMonth: number[],
	months: number[],
	daysOfWeek: number[],
	count: number,
): string[] {
	const runs: string[] = [];
	const now = new Date();
	const date = new Date(now);
	date.setSeconds(0);
	date.setMilliseconds(0);
	date.setMinutes(date.getMinutes() + 1);

	let attempts = 0;
	while (runs.length < count && attempts < 525600) {
		attempts++;
		if (
			minutes.includes(date.getMinutes()) &&
			hours.includes(date.getHours()) &&
			daysOfMonth.includes(date.getDate()) &&
			months.includes(date.getMonth() + 1) &&
			daysOfWeek.includes(date.getDay())
		) {
			runs.push(date.toLocaleString('zh-CN', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
			}));
		}
		date.setMinutes(date.getMinutes() + 1);
	}
	return runs;
}

export function parseCron(expression: string): { ok: true; result: CronResult } | { ok: false; error: string } {
	const parts = expression.trim().split(/\s+/);
	if (parts.length !== 5 && parts.length !== 6) {
		return { ok: false, error: 'Cron 表达式必须包含 5 或 6 个字段：[秒] 分 时 日 月 周' };
	}
	try {
		// 6-field format: seconds minutes hours day-of-month month day-of-week
		// 5-field format: minutes hours day-of-month month day-of-week
		const fields = parts.length === 6
			? { minute: parts[1], hour: parts[2], dayOfMonth: parts[3], month: parts[4], dayOfWeek: parts[5] }
			: { minute: parts[0], hour: parts[1], dayOfMonth: parts[2], month: parts[3], dayOfWeek: parts[4] };

		const { minute, hour, dayOfMonth, month, dayOfWeek } = fields;
		const minutes = parseField(minute, 0, 59);
		const hours = parseField(hour, 0, 23);
		const daysOfMonth = parseField(dayOfMonth, 1, 31);
		const months = parseField(month, 1, 12);
		const daysOfWeek = parseField(dayOfWeek, 0, 7).map(d => d === 7 ? 0 : d);

		const description = buildDescription(minute, hour, dayOfMonth, month, dayOfWeek);
		const nextRuns = getNextRuns(minutes, hours, daysOfMonth, months, daysOfWeek, 5);

		return {
			ok: true,
			result: {
				expression: expression.trim(),
				description,
				nextRuns,
				fields: { minutes, hours, daysOfMonth, months, daysOfWeek },
			},
		};
	} catch (e) {
		return { ok: false, error: '解析失败：' + String(e) };
	}
}

export { MONTH_NAMES, DAY_NAMES };
export type { CronResult };
