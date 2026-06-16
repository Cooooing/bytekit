export type JsonFormatResult =
	| { ok: true; output: string }
	| { ok: false; error: string };

export function formatJson(input: string, indent = 2): JsonFormatResult {
	const trimmed = input.trim();

	if (!trimmed) {
		return { ok: false, error: '请输入 JSON 内容。' };
	}

	try {
		const parsed = JSON.parse(trimmed) as unknown;
		return { ok: true, output: JSON.stringify(parsed, null, indent) };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : 'JSON 解析失败。',
		};
	}
}

export function minifyJson(input: string): JsonFormatResult {
	const trimmed = input.trim();

	if (!trimmed) {
		return { ok: false, error: '请输入 JSON 内容。' };
	}

	try {
		const parsed = JSON.parse(trimmed) as unknown;
		return { ok: true, output: JSON.stringify(parsed) };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : 'JSON 解析失败。',
		};
	}
}

export function unescapeJson(input: string): JsonFormatResult {
	if (!input.trim()) {
		return { ok: false, error: '请输入内容。' };
	}

	try {
		// Remove JSON string escape sequences
		let result = input;
		result = result.replace(/\\\\n/g, '\n');
		result = result.replace(/\\\\r/g, '\r');
		result = result.replace(/\\\\t/g, '\t');
		result = result.replace(/\\\\"/g, '"');
		result = result.replace(/\\\\\\\\/g, '\\');
		return { ok: true, output: result };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : '去转义失败。',
		};
	}
}

export function escapeJson(input: string): JsonFormatResult {
	if (!input.trim()) {
		return { ok: false, error: '请输入内容。' };
	}

	try {
		let result = input;
		result = result.replace(/\\/g, '\\\\');
		result = result.replace(/"/g, '\\"');
		result = result.replace(/\n/g, '\\n');
		result = result.replace(/\r/g, '\\r');
		result = result.replace(/\t/g, '\\t');
		return { ok: true, output: result };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : '转义失败。',
		};
	}
}
