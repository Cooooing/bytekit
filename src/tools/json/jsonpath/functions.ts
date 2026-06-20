export function evaluateJsonPath(data: unknown, path: string): { ok: true; results: unknown[] } | { ok: false; error: string } {
	try {
		if (typeof data === 'string') data = JSON.parse(data);
		const results = queryJsonPath(data, path);
		return { ok: true, results };
	} catch (e) {
		return { ok: false, error: String(e) };
	}
}

function queryJsonPath(obj: unknown, path: string): unknown[] {
	const parts = path.replace(/^\$\.?/, '').split('.').flatMap((p) => p.split('[').flatMap((seg, i) => {
		if (i === 0) return [seg];
		const idx = seg.replace(']', '');
		return idx === '*' ? ['*'] : [idx];
	}));

	let current: unknown[] = [obj];
	for (const part of parts) {
		if (part === '') continue;
		const next: unknown[] = [];
		for (const item of current) {
			if (part === '*') {
				if (Array.isArray(item)) next.push(...item);
				else if (typeof item === 'object' && item !== null) next.push(...Object.values(item));
			} else if (Array.isArray(item)) {
				const idx = parseInt(part, 10);
				if (!isNaN(idx) && idx >= 0 && idx < item.length) next.push(item[idx]);
			} else if (typeof item === 'object' && item !== null && part in item) {
				next.push((item as Record<string, unknown>)[part]);
			}
		}
		current = next;
	}
	return current;
}
