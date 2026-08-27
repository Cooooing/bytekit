import type { CodeEditorLanguage } from '@features/tools/shared/CodeEditor';

export interface KeyValueRow {
	id: string;
	key: string;
	value: string;
	enabled: boolean;
}

export type PayloadFormat = 'auto' | 'json' | 'xml' | 'text';

export function buildWebSocketUrl(baseUrl: string, queryRows: KeyValueRow[]): { ok: true; url: string } | { ok: false; error: string } {
	const trimmed = baseUrl.trim();
	if (!trimmed) return { ok: false, error: '请输入 WebSocket 地址。' };

	let parsed: URL;
	try {
		parsed = new URL(trimmed);
	} catch {
		return { ok: false, error: 'WebSocket 地址格式无效。' };
	}

	if (parsed.protocol !== 'ws:' && parsed.protocol !== 'wss:') {
		return { ok: false, error: 'WebSocket 地址必须以 ws:// 或 wss:// 开头。' };
	}

	if (parsed.search) {
		return { ok: false, error: '请把 Query 参数放到参数表格中，不要写在 URL 里。' };
	}

	if (parsed.hash) {
		return { ok: false, error: 'WebSocket 地址不支持片段标识。' };
	}

	for (const row of queryRows) {
		if (!row.enabled || !row.key.trim()) continue;
		parsed.searchParams.append(row.key.trim(), row.value);
	}

	return { ok: true, url: parsed.toString() };
}

export function enabledPairs(rows: KeyValueRow[]): Array<{ key: string; value: string }> {
	return rows
		.filter((row) => row.enabled && row.key.trim())
		.map((row) => ({ key: row.key.trim(), value: row.value }));
}

export function detectPayloadFormat(value: string, preferred: PayloadFormat): Exclude<PayloadFormat, 'auto'> {
	if (preferred !== 'auto') return preferred;
	const trimmed = value.trim();
	if (!trimmed) return 'text';
	try {
		JSON.parse(trimmed);
		return 'json';
	} catch {
		return /^<[\s\S]*>$/.test(trimmed) ? 'xml' : 'text';
	}
}

export function editorLanguage(format: Exclude<PayloadFormat, 'auto'>): CodeEditorLanguage {
	if (format === 'json') return 'json';
	if (format === 'xml') return 'html';
	return 'text';
}

export function formatPayload(value: string, preferred: PayloadFormat): { ok: true; value: string; format: Exclude<PayloadFormat, 'auto'> } | { ok: false; error: string } {
	const format = detectPayloadFormat(value, preferred);
	if (format === 'json') {
		try {
			return { ok: true, value: JSON.stringify(JSON.parse(value), null, 2), format };
		} catch {
			return { ok: false, error: 'JSON 格式无效。' };
		}
	}
	if (format === 'xml') return { ok: true, value: formatXml(value), format };
	return { ok: true, value, format };
}

export function summarizePayload(value: string, maxLength = 120): string {
	const compact = value.replace(/\s+/g, ' ').trim();
	if (!compact) return '(空消息)';
	return compact.length > maxLength ? `${compact.slice(0, maxLength - 1)}...` : compact;
}

function formatXml(value: string): string {
	const tokens = value
		.trim()
		.replace(/>\s*</g, '><')
		.replace(/(<[^>]+>)/g, '\n$1\n')
		.split('\n')
		.map((part) => part.trim())
		.filter(Boolean);
	let depth = 0;
	const lines: string[] = [];
	for (const token of tokens) {
		const isClosing = /^<\//.test(token);
		const isSelfClosing = /\/>$/.test(token) || /^<\?/.test(token) || /^<!/.test(token);
		if (isClosing) depth = Math.max(0, depth - 1);
		lines.push(`${'\t'.repeat(depth)}${token}`);
		if (!isClosing && !isSelfClosing && /^<[^/!][^>]*>$/.test(token)) depth++;
	}
	return lines.join('\n');
}
