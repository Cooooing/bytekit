import { describe, expect, it } from 'vitest';
import { detectCsvDelimiter, normalizeRows } from './functions';

describe('spreadsheet preview helpers', () => {
	it('detects common CSV delimiters', () => {
		expect(detectCsvDelimiter('name;age;city')).toBe(';');
		expect(detectCsvDelimiter('name\tage')).toBe('\t');
	});

	it('normalizes sparse rows for a stable table', () => {
		expect(normalizeRows([['name', 'age'], ['Ada']])).toEqual([['name', 'age'], ['Ada', '']]);
	});
});
