import { describe, expect, it } from 'vitest';
import { buildWebSocketUrl, detectPayloadFormat, enabledPairs, formatPayload, summarizePayload, type KeyValueRow } from './functions';

const rows: KeyValueRow[] = [
	{ id: '1', key: 'room', value: 'alpha', enabled: true },
	{ id: '2', key: 'token', value: 'a b', enabled: true },
	{ id: '3', key: 'ignored', value: 'nope', enabled: false },
	{ id: '4', key: '', value: 'empty', enabled: true },
];

describe('WebSocket 测试工具函数', () => {
	it('构建 ws/wss 地址并单独拼接 Query 参数', () => {
		expect(buildWebSocketUrl('ws://127.0.0.1:8080/ws', rows)).toEqual({
			ok: true,
			url: 'ws://127.0.0.1:8080/ws?room=alpha&token=a+b',
		});
		expect(buildWebSocketUrl('wss://example.com/socket', rows).ok).toBe(true);
	});

	it('拒绝非 WebSocket 协议和 URL 内联 Query', () => {
		expect(buildWebSocketUrl('https://example.com', rows).ok).toBe(false);
		expect(buildWebSocketUrl('wss://example.com/socket?room=alpha', rows)).toEqual({
			ok: false,
			error: '请把 Query 参数放到参数表格中，不要写在 URL 里。',
		});
	});

	it('筛选启用的键值配置', () => {
		expect(enabledPairs(rows)).toEqual([
			{ key: 'room', value: 'alpha' },
			{ key: 'token', value: 'a b' },
		]);
	});

	it('识别并格式化 JSON 和 XML 文本', () => {
		expect(detectPayloadFormat('{"type":"join"}', 'auto')).toBe('json');
		expect(formatPayload('{"type":"join","room":"alpha"}', 'json')).toEqual({
			ok: true,
			value: '{\n  "type": "join",\n  "room": "alpha"\n}',
			format: 'json',
		});
		expect(detectPayloadFormat('<event><type>join</type></event>', 'auto')).toBe('xml');
		expect(formatPayload('<event><type>join</type></event>', 'xml')).toEqual({
			ok: true,
			value: '<event>\n\t<type>\n\t\tjoin\n\t</type>\n</event>',
			format: 'xml',
		});
	});

	it('生成单行消息摘要', () => {
		expect(summarizePayload('{\n  "type": "message"\n}', 18)).toBe('{ "type": "messag...');
		expect(summarizePayload('')).toBe('(空消息)');
	});
});
