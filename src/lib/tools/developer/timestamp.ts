export type TimestampResult =
	| { ok: true; unix: number; iso: string; local: string; utc: string }
	| { ok: false; error: string };

export function parseTimestamp(input: string): TimestampResult {
	const trimmed = input.trim();
	if (!trimmed) return { ok: false, error: '请输入时间戳或日期。' };

	// Try parsing as number (Unix timestamp in seconds or milliseconds)
	const num = Number(trimmed);
	if (!isNaN(num) && trimmed !== '') {
		const ms = num > 1e12 ? num : num * 1000;
		const date = new Date(ms);
		if (isNaN(date.getTime())) return { ok: false, error: '无效的时间戳。' };
		return format(date);
	}

	// Try parsing as date string
	const date = new Date(trimmed);
	if (isNaN(date.getTime())) return { ok: false, error: '无法解析为有效日期。' };
	return format(date);
}

function format(date: Date): TimestampResult {
	return {
		ok: true,
		unix: Math.floor(date.getTime() / 1000),
		iso: date.toISOString(),
		local: date.toLocaleString('zh-CN', { dateStyle: 'full', timeStyle: 'medium' }),
		utc: date.toUTCString(),
	};
}

export function now(): TimestampResult {
	return format(new Date());
}
