export type BaseInputMode = 'auto' | 'base-2' | 'base-8' | 'base-10' | 'base-16' | 'custom';

export interface BaseConverterOptions {
	input: string;
	inputMode: BaseInputMode;
	sourceBase: number;
	targetBase: number;
}

export interface BaseConversionRow {
	source: string;
	binary: string;
	octal: string;
	decimal: string;
	hex: string;
	custom: string;
}

export interface BaseConversionResult {
	rows: BaseConversionRow[];
	targetBase: number;
}

export type BaseConverterResult =
	| { ok: true; result: BaseConversionResult }
	| { ok: false; error: string };

const DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const MAX_ROWS = 200;
const MAX_DIGITS = 5000;

export function convertBases(options: BaseConverterOptions): BaseConverterResult {
	const targetBase = normalizeBase(options.targetBase, '目标进制');
	if (!targetBase.ok) return targetBase;

	const lines = options.input
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);

	if (lines.length === 0) return { ok: false, error: '请输入需要转换的数值。' };
	if (lines.length > MAX_ROWS) return { ok: false, error: `最多支持 ${MAX_ROWS} 行输入。` };

	const rows: BaseConversionRow[] = [];
	for (const line of lines) {
		const parsed = parseIntegerByMode(line, options.inputMode, options.sourceBase);
		if (!parsed.ok) return parsed;
		rows.push({
			source: line,
			binary: formatValue(parsed.value, 2, true),
			octal: formatValue(parsed.value, 8, true),
			decimal: formatValue(parsed.value, 10, false),
			hex: formatValue(parsed.value, 16, true),
			custom: formatValue(parsed.value, targetBase.base, false),
		});
	}

	return { ok: true, result: { rows, targetBase: targetBase.base } };
}

function parseIntegerByMode(input: string, mode: BaseInputMode, customBase: number): { ok: true; value: bigint } | { ok: false; error: string } {
	const sign = input.startsWith('-') ? -1n : 1n;
	const unsigned = input.replace(/^[+-]/, '');
	if (!unsigned) return { ok: false, error: `无法解析数值：${input}` };

	if (mode === 'auto') return parseAutoInteger(input, sign, unsigned);

	const base = mode === 'custom'
		? normalizeBase(customBase, '源进制')
		: { ok: true as const, base: Number(mode.replace('base-', '')) };
	if (!base.ok) return base;
	return parseUnsignedInteger(unsigned, base.base, sign, input);
}

function parseAutoInteger(input: string, sign: bigint, unsigned: string): { ok: true; value: bigint } | { ok: false; error: string } {
	if (/^0b/i.test(unsigned)) return parseUnsignedInteger(unsigned.slice(2), 2, sign, input);
	if (/^0o/i.test(unsigned)) return parseUnsignedInteger(unsigned.slice(2), 8, sign, input);
	if (/^0x/i.test(unsigned)) return parseUnsignedInteger(unsigned.slice(2), 16, sign, input);
	return parseUnsignedInteger(unsigned, 10, sign, input);
}

function parseUnsignedInteger(raw: string, base: number, sign: bigint, original: string): { ok: true; value: bigint } | { ok: false; error: string } {
	const normalized = raw.replace(/_/g, '').toUpperCase();
	if (!normalized) return { ok: false, error: `无法解析数值：${original}` };
	if (normalized.length > MAX_DIGITS) return { ok: false, error: `单个数值最多支持 ${MAX_DIGITS} 位。` };

	let value = 0n;
	const bigBase = BigInt(base);
	for (const char of normalized) {
		const digit = DIGITS.indexOf(char);
		if (digit < 0 || digit >= base) return { ok: false, error: `${original} 不是合法的 ${base} 进制数。` };
		value = value * bigBase + BigInt(digit);
	}
	return { ok: true, value: value * sign };
}

function normalizeBase(base: number, label: string): { ok: true; base: number } | { ok: false; error: string } {
	if (!Number.isInteger(base) || base < 2 || base > 36) {
		return { ok: false, error: `${label}必须是 2 到 36 之间的整数。` };
	}
	return { ok: true, base };
}

function formatValue(value: bigint, base: number, withPrefix: boolean): string {
	const negative = value < 0n;
	const absValue = negative ? -value : value;
	const body = absValue.toString(base).toUpperCase();
	const prefix = withPrefix ? getPrefix(base) : '';
	return `${negative ? '-' : ''}${prefix}${body}`;
}

function getPrefix(base: number): string {
	if (base === 2) return '0b';
	if (base === 8) return '0o';
	if (base === 16) return '0x';
	return '';
}
