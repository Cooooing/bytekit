export type CsvDelimiter = ',' | ';' | '\t' | '|';

export function detectCsvDelimiter(input: string): CsvDelimiter {
	const firstLine = input.split(/\r?\n/, 1)[0] ?? '';
	const candidates: CsvDelimiter[] = [',', ';', '\t', '|'];
	return candidates.reduce((best, candidate) => count(firstLine, candidate) > count(firstLine, best) ? candidate : best, ',');
}

export function normalizeRows(rows: unknown[][]) {
	const width = rows.reduce((max, row) => Math.max(max, row.length), 0);
	return rows.map((row) => Array.from({ length: width }, (_, index) => row[index] == null ? '' : String(row[index])));
}

function count(value: string, token: string) {
	return value.split(token).length - 1;
}
