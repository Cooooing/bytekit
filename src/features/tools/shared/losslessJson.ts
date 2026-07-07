import {
	LosslessNumber,
	isLosslessNumber,
	isSafeNumber,
	parse,
	stringify,
} from 'lossless-json';

export type JsonParseResult = { ok: true; value: unknown } | { ok: false; error: string };

export function parseJsonLossless(input: string): unknown {
	return parse(input, null, {
		parseNumber(value) {
			return isSafeNumber(value, { approx: false }) ? Number(value) : new LosslessNumber(value);
		},
		onDuplicateKey(info) {
			return info.newValue;
		},
	});
}

export function tryParseJsonLossless(input: string): JsonParseResult {
	try {
		return { ok: true, value: parseJsonLossless(input) };
	} catch (error) {
		return { ok: false, error: error instanceof Error ? error.message : 'JSON 解析失败。' };
	}
}

export function stringifyJsonLossless(value: unknown, indent?: number): string {
	return stringify(value, null, indent) ?? '';
}

export function toPlainJsonValue(value: unknown): unknown {
	if (isLosslessNumber(value)) {
		return isSafeNumber(value.value, { approx: false }) ? Number(value.value) : value.value;
	}
	if (Array.isArray(value)) return value.map(toPlainJsonValue);
	if (isPlainObject(value)) {
		const output: Record<string, unknown> = {};
		for (const [key, item] of Object.entries(value)) {
			output[key] = toPlainJsonValue(item);
		}
		return output;
	}
	if (typeof value === 'number' && Number.isInteger(value) && !Number.isSafeInteger(value)) {
		return String(value);
	}
	return value;
}

export function getJsonNumberText(value: unknown): string | undefined {
	if (isLosslessNumber(value)) return value.value;
	if (typeof value === 'number' && Number.isFinite(value)) return String(value);
	return undefined;
}

export function isLosslessJsonNumber(value: unknown): value is LosslessNumber {
	return isLosslessNumber(value);
}

export function containsUnsafeJsonNumber(value: unknown): boolean {
	if (isLosslessNumber(value)) return !isSafeNumber(value.value, { approx: false });
	if (typeof value === 'number') return Number.isInteger(value) && !Number.isSafeInteger(value);
	if (Array.isArray(value)) return value.some(containsUnsafeJsonNumber);
	if (isPlainObject(value)) return Object.values(value).some(containsUnsafeJsonNumber);
	return false;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value) && !isLosslessNumber(value);
}
