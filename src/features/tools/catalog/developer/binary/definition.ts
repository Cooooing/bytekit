import type { ToolCategory, ToolDefinition } from '../../types';

export const category: ToolCategory = {
	id: 'developer',
	name: '开发工具',
	description: '时间、ID、Cron、二进制等开发常用工具。',
	icon: 'code',
};

export const definition: ToolDefinition = {
	id: 'binary',
	href: 'tools/developer/binary',
	name: '二进制运算',
	shortName: 'Binary',
	description: '执行 AND、OR、XOR、NOT、移位、循环移位和多输入算术运算。',
	category: 'developer',
	keywords: ['binary', 'bit', 'and', 'or', 'xor', 'not', 'shift', 'rotate', '二进制', '位运算', '移位'],
};
