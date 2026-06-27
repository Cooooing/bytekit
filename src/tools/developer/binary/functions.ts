export type BinaryOperation =
	| 'and'
	| 'or'
	| 'xor'
	| 'nand'
	| 'nor'
	| 'xnor'
	| 'add'
	| 'subtract'
	| 'multiply'
	| 'divide'
	| 'mod'
	| 'not'
	| 'shift-left'
	| 'shift-right'
	| 'rotate-left'
	| 'rotate-right';

export interface BinaryCalculateOptions {
	operation: BinaryOperation;
	input: string;
	width?: number;
	shift?: number;
}

export interface BinaryCalculateResult {
	operation: BinaryOperation;
	inputs: bigint[];
	width: number;
	decimal: string;
	binary: string;
	hex: string;
	octal: string;
}

export type BinaryResult =
	| { ok: true; result: BinaryCalculateResult }
	| { ok: false; error: string };

const MAX_INPUT_COUNT = 1000;
const MAX_WIDTH = 4096;
const FIXED_WIDTH_OPERATIONS = new Set<BinaryOperation>(['nand', 'nor', 'xnor', 'not', 'rotate-left', 'rotate-right']);
const SINGLE_INPUT_OPERATIONS = new Set<BinaryOperation>(['not', 'shift-left', 'shift-right', 'rotate-left', 'rotate-right']);

export function calculateBinary(options: BinaryCalculateOptions): BinaryResult {
	const parsed = parseBinaryInputs(options.input);
	if (!parsed.ok) return parsed;

	const inputs = parsed.inputs;
	const width = resolveWidth(inputs, options.width, options.operation);
	if (!width.ok) return width;

	const shift = options.shift ?? 1;
	if (!Number.isInteger(shift) || shift < 0) return { ok: false, error: '移位数量必须是非负整数。' };
	if (SINGLE_INPUT_OPERATIONS.has(options.operation) && inputs.length !== 1) {
		return { ok: false, error: '该操作只支持一个输入值。' };
	}

	const calculated = runOperation(options.operation, inputs, width.width, shift);
	if (!calculated.ok) return calculated;

	return {
		ok: true,
		result: {
			operation: options.operation,
			inputs,
			width: width.width,
			decimal: calculated.value.toString(10),
			binary: formatRadix(calculated.value, 2, width.width, options.operation),
			hex: formatRadix(calculated.value, 16),
			octal: formatRadix(calculated.value, 8),
		},
	};
}

function parseBinaryInputs(input: string): { ok: true; inputs: bigint[] } | { ok: false; error: string } {
	const tokens = input
		.split(/[\s,，]+/)
		.map((token) => token.trim())
		.filter(Boolean);

	if (tokens.length === 0) return { ok: false, error: '请输入至少一个数值。' };
	if (tokens.length > MAX_INPUT_COUNT) return { ok: false, error: `最多支持 ${MAX_INPUT_COUNT} 个输入。` };

	const inputs: bigint[] = [];
	for (const token of tokens) {
		const parsed = parseIntegerToken(token);
		if (!parsed.ok) return parsed;
		inputs.push(parsed.value);
	}
	return { ok: true, inputs };
}

function parseIntegerToken(token: string): { ok: true; value: bigint } | { ok: false; error: string } {
	if (token.startsWith('-')) return { ok: false, error: `暂不支持负数输入：${token}` };
	const normalized = token.replace(/_/g, '');
	try {
		if (/^0b[01]+$/i.test(normalized)) return { ok: true, value: BigInt(normalized) };
		if (/^0x[0-9a-f]+$/i.test(normalized)) return { ok: true, value: BigInt(normalized) };
		if (/^0o[0-7]+$/i.test(normalized)) return { ok: true, value: BigInt(normalized) };
		if (/^[01]+$/.test(normalized)) return { ok: true, value: BigInt(`0b${normalized}`) };
		if (/^\d+$/.test(normalized)) return { ok: true, value: BigInt(normalized) };
		return { ok: false, error: `无法识别数值：${token}` };
	} catch {
		return { ok: false, error: `无法解析数值：${token}` };
	}
}

function resolveWidth(inputs: bigint[], requestedWidth: number | undefined, operation: BinaryOperation): { ok: true; width: number } | { ok: false; error: string } {
	const minWidth = Math.max(1, ...inputs.map(bitLength));
	const width = requestedWidth ?? minWidth;
	if (!Number.isInteger(width) || width <= 0) return { ok: false, error: '位宽必须是正整数。' };
	if (width > MAX_WIDTH) return { ok: false, error: `位宽不能超过 ${MAX_WIDTH}。` };
	if (FIXED_WIDTH_OPERATIONS.has(operation) && width < minWidth) {
		return { ok: false, error: `当前输入至少需要 ${minWidth} 位。` };
	}
	return { ok: true, width };
}

function runOperation(operation: BinaryOperation, inputs: bigint[], width: number, shift: number): { ok: true; value: bigint } | { ok: false; error: string } {
	const mask = (1n << BigInt(width)) - 1n;
	switch (operation) {
		case 'and':
			return { ok: true, value: inputs.reduce((acc, value) => acc & value) };
		case 'or':
			return { ok: true, value: inputs.reduce((acc, value) => acc | value) };
		case 'xor':
			return { ok: true, value: inputs.reduce((acc, value) => acc ^ value) };
		case 'nand':
			return { ok: true, value: mask ^ inputs.reduce((acc, value) => acc & value) };
		case 'nor':
			return { ok: true, value: mask ^ inputs.reduce((acc, value) => acc | value) };
		case 'xnor':
			return { ok: true, value: mask ^ inputs.reduce((acc, value) => acc ^ value) };
		case 'add':
			return { ok: true, value: inputs.reduce((acc, value) => acc + value, 0n) };
		case 'subtract':
			return { ok: true, value: inputs.slice(1).reduce((acc, value) => acc - value, inputs[0]) };
		case 'multiply':
			return { ok: true, value: inputs.reduce((acc, value) => acc * value, 1n) };
		case 'divide':
			return divideSequence(inputs);
		case 'mod':
			return modSequence(inputs);
		case 'not':
			return { ok: true, value: mask ^ inputs[0] };
		case 'shift-left':
			return { ok: true, value: inputs[0] << BigInt(shift) };
		case 'shift-right':
			return { ok: true, value: inputs[0] >> BigInt(shift) };
		case 'rotate-left':
			return { ok: true, value: rotateLeft(inputs[0], width, shift) };
		case 'rotate-right':
			return { ok: true, value: rotateRight(inputs[0], width, shift) };
	}
}

function divideSequence(inputs: bigint[]): { ok: true; value: bigint } | { ok: false; error: string } {
	let value = inputs[0];
	for (const divisor of inputs.slice(1)) {
		if (divisor === 0n) return { ok: false, error: '除数不能为 0。' };
		value /= divisor;
	}
	return { ok: true, value };
}

function modSequence(inputs: bigint[]): { ok: true; value: bigint } | { ok: false; error: string } {
	let value = inputs[0];
	for (const divisor of inputs.slice(1)) {
		if (divisor === 0n) return { ok: false, error: '取模除数不能为 0。' };
		value %= divisor;
	}
	return { ok: true, value };
}

function rotateLeft(value: bigint, width: number, shift: number): bigint {
	const normalizedShift = shift % width;
	const mask = (1n << BigInt(width)) - 1n;
	const normalized = value & mask;
	if (normalizedShift === 0) return normalized;
	const bits = BigInt(normalizedShift);
	return ((normalized << bits) | (normalized >> BigInt(width - normalizedShift))) & mask;
}

function rotateRight(value: bigint, width: number, shift: number): bigint {
	const normalizedShift = shift % width;
	const mask = (1n << BigInt(width)) - 1n;
	const normalized = value & mask;
	if (normalizedShift === 0) return normalized;
	const bits = BigInt(normalizedShift);
	return ((normalized >> bits) | (normalized << BigInt(width - normalizedShift))) & mask;
}

function bitLength(value: bigint): number {
	if (value === 0n) return 1;
	return value.toString(2).length;
}

function formatRadix(value: bigint, radix: 2 | 8 | 16, width?: number, operation?: BinaryOperation): string {
	const negative = value < 0n;
	const absValue = negative ? -value : value;
	const raw = absValue.toString(radix);
	const padded = radix === 2 && width && shouldPadBinary(operation) ? raw.padStart(width, '0') : raw;
	const prefix = radix === 2 ? '0b' : radix === 16 ? '0x' : '0o';
	return `${negative ? '-' : ''}${prefix}${padded}`;
}

function shouldPadBinary(operation: BinaryOperation | undefined): boolean {
	return operation === undefined || FIXED_WIDTH_OPERATIONS.has(operation);
}
