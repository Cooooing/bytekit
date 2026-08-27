export const websocketReference = [
	{
		title: '浏览器直连',
		items: [
			{ syntax: 'ws://', desc: '未加密 WebSocket 连接。' },
			{ syntax: 'wss://', desc: '加密 WebSocket 连接。' },
			{ syntax: 'Query', desc: '查询参数单独配置，连接时自动拼到 URL。' },
			{ syntax: 'Header', desc: '浏览器原生 WebSocket 不允许设置自定义请求头。' },
		],
	},
	{
		title: '消息事件',
		items: [
			{ syntax: 'Open', desc: '连接已打开。' },
			{ syntax: 'Message', desc: '收到服务端文本消息。' },
			{ syntax: 'Close', desc: '连接关闭，展示 code、reason 和 wasClean。' },
			{ syntax: 'Error', desc: '连接或传输错误。' },
			{ syntax: 'Ping/Pong', desc: '浏览器底层自动处理，但不会暴露给页面脚本。' },
		],
	},
	{
		title: '示例',
		items: [
			{ syntax: 'wss://echo.websocket.events', desc: '公共 Echo 服务。' },
			{ syntax: 'ws://127.0.0.1:8080/ws', desc: '本地开发服务。' },
			{ syntax: '{"type":"join","room":"test"}', desc: 'JSON 文本消息。' },
		],
	},
];
