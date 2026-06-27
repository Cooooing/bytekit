import type { ToolDefinition, ToolCategory } from '../../types';

export const category: ToolCategory = {
	id: 'developer',
	name: '开发工具',
	description: '时间戳、UUID、Hash 等常用开发辅助工具。',
	icon: 'settings',
};

export const definition: ToolDefinition = {
	id: 'timestamp',
	href: 'tools/developer/timestamp',
	name: '时间戳转换',
	shortName: '时间戳',
	description: 'Unix 时间戳与日期时间互转，支持多时区。',
	category: 'developer',
	keywords: ['timestamp', 'unix', '时间戳', '日期', 'date', 'time', 'epoch'],
};
