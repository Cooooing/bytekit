import { fail, ok, requireTrimmedInput, type ToolResult } from '../../format/result';
import { parseJsonLossless, stringifyJsonLossless } from '../../../shared/losslessJson';

export type JsonFormatResult =
	| { ok: true; output: string }
	| { ok: false; error: string };

type JsonDocumentsResult =
	| { ok: true; documents: unknown[] }
	| { ok: false; error: string };

export function formatJson(input: string, indent = 2): JsonFormatResult {
	const trimmed = requireTrimmedInput(input, '请输入 JSON 内容。');
	if (typeof trimmed !== 'string') return trimmed;

	const parsed = parseJsonDocuments(trimmed);
	if (!parsed.ok) return parsed;

	return ok(parsed.documents.map((document) => stringifyJsonDocument(document, indent)).join('\n\n'));
}

export function minifyJson(input: string): JsonFormatResult {
	const trimmed = requireTrimmedInput(input, '请输入 JSON 内容。');
	if (typeof trimmed !== 'string') return trimmed;

	const parsed = parseJsonDocuments(trimmed);
	if (!parsed.ok) return parsed;

	return ok(parsed.documents.map((document) => stringifyJsonDocument(document)).join('\n\n'));
}

function parseJsonDocuments(input: string): JsonDocumentsResult {
	const documents: unknown[] = [];
	let position = 0;
	let index = 1;

	while (position < input.length) {
		position = skipJsonWhitespace(input, position);
		if (position >= input.length) break;

		const scanned = scanJsonValueEnd(input, position, index);
		if (!scanned.ok) return fail(scanned.error);

		try {
			documents.push(parseJsonLossless(input.slice(position, scanned.end)));
		} catch (error) {
			const message = error instanceof Error ? error.message : 'JSON 解析失败。';
			return fail(`第 ${index} 个 JSON 在第 ${position + 1} 个字符附近解析失败：${message}`);
		}

		if (scanned.end < input.length && !isJsonWhitespace(input[scanned.end])) {
			return fail(`第 ${index} 个 JSON 后必须使用空白字符分隔（第 ${scanned.end + 1} 个字符）。`);
		}

		position = scanned.end;
		index += 1;
	}

	return { ok: true, documents };
}

function stringifyJsonDocument(document: unknown, indent?: number): string {
	return stringifyJsonLossless(document, indent);
}

function skipJsonWhitespace(input: string, position: number): number {
	while (position < input.length && isJsonWhitespace(input[position])) {
		position += 1;
	}
	return position;
}

function isJsonWhitespace(char: string | undefined): boolean {
	return char === ' ' || char === '\n' || char === '\r' || char === '\t';
}

function scanJsonValueEnd(input: string, start: number, index: number): { ok: true; end: number } | { ok: false; error: string } {
	const char = input[start];

	if (char === '{' || char === '[') return scanCompositeEnd(input, start, index);
	if (char === '"') return scanStringEnd(input, start, index);
	if (char === 't') return scanLiteralEnd(input, start, 'true', index);
	if (char === 'f') return scanLiteralEnd(input, start, 'false', index);
	if (char === 'n') return scanLiteralEnd(input, start, 'null', index);
	if (char === '-' || isDigit(char)) return scanNumberEnd(input, start, index);

	return fail(`第 ${index} 个 JSON 在第 ${start + 1} 个字符附近解析失败：不是合法的 JSON 值起始字符。`);
}

function scanCompositeEnd(input: string, start: number, index: number): { ok: true; end: number } | { ok: false; error: string } {
	const stack = [input[start] === '{' ? '}' : ']'];
	let inString = false;

	for (let position = start + 1; position < input.length; position += 1) {
		const char = input[position];

		if (inString) {
			if (char === '\\') {
				position += 1;
				continue;
			}
			if (char === '"') inString = false;
			continue;
		}

		if (char === '"') {
			inString = true;
			continue;
		}

		if (char === '{') {
			stack.push('}');
			continue;
		}
		if (char === '[') {
			stack.push(']');
			continue;
		}
		if (char === '}' || char === ']') {
			if (char !== stack[stack.length - 1]) {
				return fail(`第 ${index} 个 JSON 在第 ${position + 1} 个字符附近解析失败：括号闭合不匹配。`);
			}
			stack.pop();
			if (stack.length === 0) return { ok: true, end: position + 1 };
		}
	}

	return fail(`第 ${index} 个 JSON 在第 ${start + 1} 个字符附近解析失败：JSON 未闭合。`);
}

function scanStringEnd(input: string, start: number, index: number): { ok: true; end: number } | { ok: false; error: string } {
	for (let position = start + 1; position < input.length; position += 1) {
		const char = input[position];
		if (char === '\\') {
			position += 1;
			continue;
		}
		if (char === '"') return { ok: true, end: position + 1 };
	}

	return fail(`第 ${index} 个 JSON 在第 ${start + 1} 个字符附近解析失败：字符串未闭合。`);
}

function scanLiteralEnd(input: string, start: number, literal: 'true' | 'false' | 'null', index: number): { ok: true; end: number } | { ok: false; error: string } {
	if (input.startsWith(literal, start)) return { ok: true, end: start + literal.length };
	return fail(`第 ${index} 个 JSON 在第 ${start + 1} 个字符附近解析失败：字面量无效。`);
}

function scanNumberEnd(input: string, start: number, index: number): { ok: true; end: number } | { ok: false; error: string } {
	const match = input.slice(start).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
	if (!match) {
		return fail(`第 ${index} 个 JSON 在第 ${start + 1} 个字符附近解析失败：数字无效。`);
	}
	return { ok: true, end: start + match[0].length };
}

function isDigit(char: string | undefined): boolean {
	return char !== undefined && char >= '0' && char <= '9';
}

export function unescapeJson(input: string): JsonFormatResult {
	if (!input.trim()) {
		return fail('请输入内容。');
	}

	try {
		// Remove JSON string escape sequences
		let result = input;
		result = result.replace(/\\\\n/g, '\n');
		result = result.replace(/\\\\r/g, '\r');
		result = result.replace(/\\\\t/g, '\t');
		result = result.replace(/\\\\"/g, '"');
		result = result.replace(/\\\\\\\\/g, '\\');
		return ok(result);
	} catch (error) {
		return fail(error instanceof Error ? error.message : '去转义失败。');
	}
}

export function escapeJson(input: string): JsonFormatResult {
	if (!input.trim()) {
		return fail('请输入内容。');
	}

	try {
		let result = input;
		result = result.replace(/\\/g, '\\\\');
		result = result.replace(/"/g, '\\"');
		result = result.replace(/\n/g, '\\n');
		result = result.replace(/\r/g, '\\r');
		result = result.replace(/\t/g, '\\t');
		return ok(result);
	} catch (error) {
		return fail(error instanceof Error ? error.message : '转义失败。');
	}
}

export type { ToolResult };
