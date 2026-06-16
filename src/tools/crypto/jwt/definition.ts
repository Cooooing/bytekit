import type { ToolDefinition, ToolCategory } from '../../types';

export const category: ToolCategory = {
	id: 'crypto',
	name: '加密/安全',
	description: '令牌解析、密码生成和本地安全工具。',
	icon: 'lock',
};

export const definition: ToolDefinition = {
	id: 'jwt',
	href: 'tools/crypto/jwt',
	name: 'JWT 解析',
	shortName: 'JWT',
	description: '解析 header 和 payload，不执行签名校验。',
	category: 'crypto',
	keywords: ['jwt', 'token', 'header', 'payload', '令牌', '解码', 'decode'],
};
