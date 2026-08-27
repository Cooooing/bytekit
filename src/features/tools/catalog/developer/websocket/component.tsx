import { useEffect, useMemo, useRef, useState } from 'react';
import CodeEditor from '@features/tools/shared/CodeEditor';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useTheme } from '@themes/ThemeContext';
import Badge from '@features/tools/shared/Badge';
import { websocketReference } from './references';
import { buildWebSocketUrl, detectPayloadFormat, editorLanguage, enabledPairs, formatPayload, summarizePayload, type KeyValueRow, type PayloadFormat } from './functions';

type ConnectionStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error';
type WsEventKind = 'open' | 'message-in' | 'message-out' | 'close' | 'error' | 'control';
type ConfigTab = 'message' | 'query' | 'header';

interface WsConnectionConfig {
	id: string;
	name: string;
	url: string;
	query: KeyValueRow[];
	headers: KeyValueRow[];
	message: string;
	format: PayloadFormat;
	clearAfterSend: boolean;
}

interface WsLogEntry {
	id: string;
	connectionId: string;
	kind: WsEventKind;
	time: string;
	summary: string;
	payload: string;
	format: Exclude<PayloadFormat, 'auto'>;
}

const initialConnection: WsConnectionConfig = {
	id: 'conn-1',
	name: 'Client 1',
	url: 'wss://echo.websocket.events',
	query: [createRow('room', 'demo')],
	headers: [createRow('Authorization', 'Bearer token', false)],
	message: '{\n  "type": "message",\n  "payload": {\n    "text": "hello"\n  }\n}',
	format: 'json',
	clearAfterSend: false,
};

const statusLabel: Record<ConnectionStatus, string> = {
	idle: '未连接',
	connecting: '连接中',
	open: '已连接',
	closed: '已断开',
	error: '错误',
};

const kindLabel: Record<WsEventKind, string> = {
	open: 'Open',
	'message-in': 'Recv',
	'message-out': 'Send',
	close: 'Close',
	error: 'Error',
	control: 'Control',
};

const kindTone: Record<WsEventKind, 'neutral' | 'success' | 'danger' | 'warning' | 'info'> = {
	open: 'success',
	'message-in': 'info',
	'message-out': 'neutral',
	close: 'warning',
	error: 'danger',
	control: 'neutral',
};

export default function WebSocketTester() {
	const { Button } = useTheme();
	const sockets = useRef(new Map<string, WebSocket>());
	const [connections, setConnections] = useState<WsConnectionConfig[]>([initialConnection]);
	const [activeId, setActiveId] = useState(initialConnection.id);
	const [statuses, setStatuses] = useState<Record<string, ConnectionStatus>>({ [initialConnection.id]: 'idle' });
	const [logs, setLogs] = useState<WsLogEntry[]>([]);
	const [selectedLogId, setSelectedLogId] = useState<string>('');
	const [detailFormatPreference, setDetailFormatPreference] = useState<PayloadFormat>('auto');
	const [activeTab, setActiveTab] = useState<ConfigTab>('message');
	const active = connections.find((connection) => connection.id === activeId) ?? connections[0];
	const activeStatus = statuses[active.id] ?? 'idle';
	const urlResult = useMemo(() => buildWebSocketUrl(active.url, active.query), [active.url, active.query]);
	const visibleLogs = logs.filter((log) => log.connectionId === active.id);
	const selectedLog = logs.find((log) => log.id === selectedLogId) ?? visibleLogs.at(-1);
	const detailResult = selectedLog ? formatPayload(selectedLog.payload, detailFormatPreference === 'auto' ? selectedLog.format : detailFormatPreference) : null;
	const detailFormat = detailResult?.ok ? detailResult.format : selectedLog?.format ?? 'text';
	const detailValue = detailResult?.ok ? detailResult.value : selectedLog?.payload ?? '';
	const editorFormat = detectPayloadFormat(active.message, active.format);

	useToolRefPanel('WebSocket 参考', websocketReference);

	useEffect(() => {
		return () => {
			for (const socket of sockets.current.values()) {
				if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) socket.close(1000, 'Tool unmounted');
			}
			sockets.current.clear();
		};
	}, []);

	return (
		<div className="websocket-tool">
			<section className="websocket-workbench" aria-label="WebSocket 工作台">
				<div className="websocket-client-bar">
					<div className="websocket-tabs" role="tablist" aria-label="WebSocket 连接">
						{connections.map((connection) => {
							const status = statuses[connection.id] ?? 'idle';
							return (
								<button
									key={connection.id}
									type="button"
									className={connection.id === active.id ? 'websocket-tab websocket-tab--active' : 'websocket-tab'}
									onClick={() => setActiveId(connection.id)}
								>
									<span>{connection.name}</span>
									<span className={`websocket-status-dot websocket-status-dot--${status}`} aria-label={statusLabel[status]} />
								</button>
							);
						})}
					</div>
					<div className="websocket-bar-actions">
						<Button variant="secondary" onClick={addConnection}>新增连接</Button>
						<Button variant="secondary" onClick={duplicateConnection}>复制连接</Button>
						<Button variant="ghost" disabled={connections.length === 1} onClick={removeConnection}>删除</Button>
					</div>
				</div>

				<div className="websocket-connect-row">
					<input className="websocket-client-name" value={active.name} onChange={(event) => updateActive({ name: event.target.value })} aria-label="连接名称" />
					<input className="websocket-url-input" type="text" value={active.url} onChange={(event) => updateActive({ url: event.target.value })} placeholder="wss://example.com/socket" aria-label="WebSocket 地址" />
					<div className="websocket-connect-actions">
						<Badge tone={activeStatus === 'open' ? 'success' : activeStatus === 'error' ? 'danger' : activeStatus === 'connecting' ? 'info' : 'neutral'}>{statusLabel[activeStatus]}</Badge>
						{activeStatus === 'open' || activeStatus === 'connecting' ? (
							<Button variant="secondary" onClick={() => disconnectActive(active.id)}>断开</Button>
						) : (
							<Button variant="primary" disabled={!urlResult.ok} onClick={connectActive}>连接</Button>
						)}
					</div>
				</div>
				{urlResult.ok ? <code className="websocket-url-preview">{urlResult.url}</code> : <p className="websocket-error">{urlResult.error}</p>}

				<div className="websocket-config-tabs" role="tablist" aria-label="配置面板">
					<TabButton active={activeTab === 'message'} onClick={() => setActiveTab('message')}>发送内容</TabButton>
					<TabButton active={activeTab === 'query'} onClick={() => setActiveTab('query')}>Query 参数</TabButton>
					<TabButton active={activeTab === 'header'} onClick={() => setActiveTab('header')}>请求头</TabButton>
					<Button variant="ghost" disabled={logs.length === 0} onClick={() => { setLogs([]); setSelectedLogId(''); }}>清空记录</Button>
				</div>

				<div className="websocket-tab-panel">
					{activeTab === 'message' ? (
						<div className="websocket-send-panel">
							<div className="websocket-send-toolbar">
								<h2 className="tool-card__title">发送内容</h2>
								<div className="websocket-toolbar-controls">
									<select value={active.format} onChange={(event) => updateActive({ format: event.target.value as PayloadFormat })} aria-label="发送内容格式">
										<option value="auto">Auto</option>
										<option value="json">JSON</option>
										<option value="xml">XML</option>
										<option value="text">Text</option>
									</select>
									<label className="inline-check websocket-clear-check">
										<input type="checkbox" checked={active.clearAfterSend} onChange={(event) => updateActive({ clearAfterSend: event.target.checked })} />
										<span>发送后清空</span>
									</label>
									<Button variant="secondary" disabled={!active.message.trim()} onClick={formatMessage}>格式化</Button>
									<Button variant="primary" disabled={activeStatus !== 'open'} onClick={sendMessage}>发送</Button>
								</div>
							</div>
							<CodeEditor title="Message" value={active.message} onChange={(message) => updateActive({ message })} language={editorLanguage(editorFormat)} minHeight="18rem" />
						</div>
					) : null}
					{activeTab === 'query' ? <ParamTable title="Query 参数" rows={active.query} onChange={(query) => updateActive({ query })} /> : null}
					{activeTab === 'header' ? <ParamTable title="请求头" rows={active.headers} onChange={(headers) => updateActive({ headers })} note="浏览器直连不会发送自定义请求头" /> : null}
				</div>

				<div className="websocket-message-grid">
					<div className="websocket-log-list">
						<div className="websocket-log-head">
							<h2 className="tool-card__title">接收区域</h2>
							<span>{visibleLogs.length} 条</span>
						</div>
						<div className="websocket-log-scroll" role="list">
							{visibleLogs.length === 0 ? (
								<div className="state-box websocket-empty">连接后显示消息和连接事件。</div>
							) : visibleLogs.map((log) => (
								<button
									key={log.id}
									type="button"
									className={selectedLog?.id === log.id ? 'websocket-log-item websocket-log-item--active' : 'websocket-log-item'}
									onClick={() => setSelectedLogId(log.id)}
								>
									<Badge tone={kindTone[log.kind]}>{kindLabel[log.kind]}</Badge>
									<span className="websocket-log-summary">{log.summary}</span>
									<time>{log.time}</time>
								</button>
							))}
						</div>
					</div>
					<div className="websocket-detail-panel">
						<div className="websocket-detail-toolbar">
							<h2 className="tool-card__title">{selectedLog ? `${kindLabel[selectedLog.kind]} 详情` : '消息详情'}</h2>
							<select value={detailFormatPreference} onChange={(event) => setDetailFormatPreference(event.target.value as PayloadFormat)} aria-label="详情格式">
								<option value="auto">Auto</option>
								<option value="json">JSON</option>
								<option value="xml">XML</option>
								<option value="text">Text</option>
							</select>
						</div>
						<CodeEditor title="Payload" value={detailValue} language={editorLanguage(detailFormat)} readOnly minHeight="34rem" message={detailResult && !detailResult.ok ? detailResult.error : selectedLog?.kind === 'control' ? selectedLog.summary : undefined} messageTone={detailResult && !detailResult.ok ? 'error' : 'neutral'} />
					</div>
				</div>
			</section>
		</div>
	);

	function connectActive() {
		const builtUrl = buildWebSocketUrl(active.url, active.query);
		if (!builtUrl.ok) {
			appendLog(active.id, 'error', builtUrl.error, 'text');
			setStatuses((current) => ({ ...current, [active.id]: 'error' }));
			return;
		}
		disconnectActive(active.id, false);
		setStatuses((current) => ({ ...current, [active.id]: 'connecting' }));
		appendLog(active.id, 'control', `准备连接 ${builtUrl.url}`, 'text');
		if (enabledPairs(active.headers).length > 0) appendLog(active.id, 'control', '已记录请求头配置；浏览器直连不会把它们加入握手。', 'text');
		const socket = new WebSocket(builtUrl.url);
		sockets.current.set(active.id, socket);
		socket.addEventListener('open', () => {
			setStatuses((current) => ({ ...current, [active.id]: 'open' }));
			appendLog(active.id, 'open', '连接已打开；浏览器会在协议层自动处理 ping/pong。', 'text');
		});
		socket.addEventListener('message', (event) => {
			if (typeof event.data !== 'string') {
				appendLog(active.id, 'message-in', '收到非文本消息，本工具不渲染 Binary 内容。', 'text');
				return;
			}
			appendLog(active.id, 'message-in', event.data, detectPayloadFormat(event.data, 'auto'));
		});
		socket.addEventListener('close', (event) => {
			sockets.current.delete(active.id);
			setStatuses((current) => ({ ...current, [active.id]: current[active.id] === 'error' ? 'error' : 'closed' }));
			appendLog(active.id, 'close', `code=${event.code} reason=${event.reason || '(empty)'} wasClean=${String(event.wasClean)}`, 'text');
		});
		socket.addEventListener('error', () => {
			setStatuses((current) => ({ ...current, [active.id]: 'error' }));
			appendLog(active.id, 'error', 'WebSocket 连接或传输错误。', 'text');
		});
	}

	function disconnectActive(connectionId: string, logClose = true) {
		const socket = sockets.current.get(connectionId);
		if (!socket) return;
		if (logClose) appendLog(connectionId, 'control', '手动断开连接。', 'text');
		socket.close(1000, 'Closed by Bytekit');
		sockets.current.delete(connectionId);
	}

	function sendMessage() {
		const socket = sockets.current.get(active.id);
		if (!socket || socket.readyState !== WebSocket.OPEN) {
			appendLog(active.id, 'error', '当前连接未打开。', 'text');
			return;
		}
		socket.send(active.message);
		appendLog(active.id, 'message-out', active.message, detectPayloadFormat(active.message, active.format));
		if (active.clearAfterSend) updateActive({ message: '' });
	}

	function formatMessage() {
		const result = formatPayload(active.message, active.format);
		if (!result.ok) {
			appendLog(active.id, 'error', result.error, 'text');
			return;
		}
		updateActive({ message: result.value, format: result.format });
	}

	function appendLog(connectionId: string, kind: WsEventKind, payload: string, format: Exclude<PayloadFormat, 'auto'>) {
		const entry: WsLogEntry = {
			id: createId('log'),
			connectionId,
			kind,
			time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
			summary: summarizePayload(payload),
			payload,
			format,
		};
		setLogs((current) => [...current.slice(-399), entry]);
		setSelectedLogId(entry.id);
	}

	function updateActive(partial: Partial<WsConnectionConfig>) {
		setConnections((current) => current.map((connection) => connection.id === active.id ? { ...connection, ...partial } : connection));
	}

	function addConnection() {
		const nextIndex = connections.length + 1;
		const next = { ...initialConnection, id: createId('conn'), name: `Client ${nextIndex}`, query: [createRow('room', 'demo')], headers: [] };
		setConnections((current) => [...current, next]);
		setStatuses((current) => ({ ...current, [next.id]: 'idle' }));
		setActiveId(next.id);
	}

	function duplicateConnection() {
		const next = {
			...active,
			id: createId('conn'),
			name: `${active.name} copy`,
			query: active.query.map((row) => ({ ...row, id: createId('row') })),
			headers: active.headers.map((row) => ({ ...row, id: createId('row') })),
		};
		setConnections((current) => [...current, next]);
		setStatuses((current) => ({ ...current, [next.id]: 'idle' }));
		setActiveId(next.id);
	}

	function removeConnection() {
		disconnectActive(active.id, false);
		setConnections((current) => {
			const next = current.filter((connection) => connection.id !== active.id);
			setActiveId(next[0]?.id ?? initialConnection.id);
			return next;
		});
		setStatuses((current) => {
			const next = { ...current };
			delete next[active.id];
			return next;
		});
		setLogs((current) => current.filter((log) => log.connectionId !== active.id));
	}
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
	return (
		<button type="button" className={active ? 'websocket-config-tab websocket-config-tab--active' : 'websocket-config-tab'} onClick={onClick}>
			{children}
		</button>
	);
}

function ParamTable({ title, rows, note, onChange }: { title: string; rows: KeyValueRow[]; note?: string; onChange: (rows: KeyValueRow[]) => void }) {
	function updateRow(id: string, partial: Partial<KeyValueRow>) {
		onChange(rows.map((row) => row.id === id ? { ...row, ...partial } : row));
	}

	return (
		<div className="tool-card__section">
			<div className="tool-card__title-row">
				<h2 className="tool-card__title">{title}</h2>
				<button type="button" className="websocket-link-button" onClick={() => onChange([...rows, createRow('', '')])}>添加</button>
			</div>
			{note ? <p className="websocket-muted">{note}</p> : null}
			<div className="websocket-param-list">
				{rows.map((row) => (
					<div key={row.id} className="websocket-param-row">
						<input type="checkbox" checked={row.enabled} onChange={(event) => updateRow(row.id, { enabled: event.target.checked })} aria-label={`${title}启用`} />
						<input value={row.key} onChange={(event) => updateRow(row.id, { key: event.target.value })} placeholder="key" aria-label={`${title}键`} />
						<input value={row.value} onChange={(event) => updateRow(row.id, { value: event.target.value })} placeholder="value" aria-label={`${title}值`} />
						<button type="button" onClick={() => onChange(rows.filter((item) => item.id !== row.id))} aria-label={`删除${title}`}>删除</button>
					</div>
				))}
			</div>
		</div>
	);
}

function createRow(key = '', value = '', enabled = true): KeyValueRow {
	return { id: createId('row'), key, value, enabled };
}

function createId(prefix: string) {
	return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
