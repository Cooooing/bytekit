import type { ToolDefinition } from '../../types';

export const definition: ToolDefinition = {
	id: 'websocket',
	href: 'tools/developer/websocket',
	name: 'WebSocket 测试',
	shortName: 'WebSocket',
	description: '连接 ws/wss 服务，管理多个连接并发送、查看文本消息。',
	category: 'developer',
	keywords: ['websocket', 'ws', 'wss', 'socket', '实时', '连接', '调试', '聊天室'],
};
