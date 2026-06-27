import { fail, ok, requireTrimmedInput } from '../result';

export type CsvResult =
	| { ok: true; output: string }
	| { ok: false; error: string };

export function jsonToCsv(input: string): CsvResult {
	const trimmed = requireTrimmedInput(input, '请输入 JSON 数据。');
	if (typeof trimmed !== 'string') return trimmed;

	try {
		const data = JSON.parse(trimmed);
		if (!Array.isArray(data)) return fail('JSON 必须是数组。');
		if (data.length === 0) return ok('');

		const headers = Object.keys(data[0]);
		const rows = data.map((row: Record<string, unknown>) =>
			headers.map((h) => {
				const val = row[h] ?? '';
				const str = String(val);
				return str.includes(',') || str.includes('"') || str.includes('\n')
					? `"${str.replace(/"/g, '""')}"` : str;
			}).join(',')
		);

		return ok([headers.join(','), ...rows].join('\n'));
	} catch (error) {
		return fail(error instanceof Error ? error.message : 'JSON 解析失败。');
	}
}

export function csvToJson(input: string): CsvResult {
	const trimmed = requireTrimmedInput(input, '请输入 CSV 数据。');
	if (typeof trimmed !== 'string') return trimmed;

	try {
		const lines = trimmed.split('\n');
		if (lines.length < 2) return fail('CSV 至少需要表头和一行数据。');

		const headers = parseCsvLine(lines[0]);
		const result = lines.slice(1).map((line) => {
			const values = parseCsvLine(line);
			const obj: Record<string, string> = {};
			headers.forEach((h, i) => { obj[h] = values[i] ?? ''; });
			return obj;
		});

		return ok(JSON.stringify(result, null, 2));
	} catch (error) {
		return fail(error instanceof Error ? error.message : 'CSV 解析失败。');
	}
}

function parseCsvLine(line: string): string[] {
	const result: string[] = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (inQuotes) {
			if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
			else if (ch === '"') inQuotes = false;
			else current += ch;
		} else {
			if (ch === '"') inQuotes = true;
			else if (ch === ',') { result.push(current); current = ''; }
			else current += ch;
		}
	}
	result.push(current);
	return result;
}
