export type ToolResult = { ok: true; output: string } | { ok: false; error: string };

export function ok(output: string): ToolResult {
	return { ok: true, output };
}

export function fail(error: string): ToolResult {
	return { ok: false, error };
}

export function requireTrimmedInput(input: string, emptyMessage: string): ToolResult | string {
	const trimmed = input.trim();
	return trimmed ? trimmed : fail(emptyMessage);
}

export function runToolOperation(
	input: string,
	emptyMessage: string,
	fallbackMessage: string,
	transform: (trimmed: string) => string,
): ToolResult {
	const trimmed = requireTrimmedInput(input, emptyMessage);
	if (typeof trimmed !== 'string') return trimmed;
	try {
		return ok(transform(trimmed));
	} catch (error) {
		return fail(error instanceof Error ? error.message : fallbackMessage);
	}
}
