export type TimestampResult =
	| { ok: true; unix: number; unixMs: number; inputKind: 'seconds' | 'milliseconds' | 'date'; iso: string; local: string; utc: string }
	| { ok: false; error: string };

export function parseTimestamp(input: string): TimestampResult {
	const trimmed = input.trim();
	if (!trimmed) return { ok: false, error: '请输入时间戳或日期。' };

	const integerTimestampPattern = /^[+-]?\d+$/;
	if (integerTimestampPattern.test(trimmed)) {
		const digits = trimmed.replace(/^[+-]/, '');
		const inputKind = digits.length >= 13 ? 'milliseconds' : digits.length <= 10 ? 'seconds' : null;
		if (!inputKind) {
			return { ok: false, error: '11 到 12 位数字无法明确判断为秒或毫秒，请输入 10 位秒时间戳、13 位毫秒时间戳，或输入日期字符串。' };
		}

		const num = Number(trimmed);
		const ms = inputKind === 'milliseconds' ? num : num * 1000;
		const date = new Date(ms);
		if (isNaN(date.getTime())) return { ok: false, error: '无效的时间戳。' };
		return format(date, inputKind);
	}

	const date = new Date(trimmed);
	if (isNaN(date.getTime())) return { ok: false, error: '无法解析为有效日期。' };
	return format(date, 'date');
}

function format(date: Date, inputKind: 'seconds' | 'milliseconds' | 'date'): TimestampResult {
	return {
		ok: true,
		unix: Math.floor(date.getTime() / 1000),
		unixMs: date.getTime(),
		inputKind,
		iso: date.toISOString(),
		local: date.toLocaleString('zh-CN', { dateStyle: 'full', timeStyle: 'medium' }),
		utc: date.toUTCString(),
	};
}

export function now(): TimestampResult {
	return format(new Date(), 'date');
}
