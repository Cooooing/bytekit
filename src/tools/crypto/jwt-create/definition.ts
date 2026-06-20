import type { ToolDefinition } from '../../types';

export const definition: ToolDefinition = {
	id: 'jwt-create',
	href: 'tools/crypto/jwt-create',
	name: 'JWT 生成器',
	shortName: 'JWT',
	description: '输入 header 和 payload，生成 JWT token。',
	category: 'crypto',
	keywords: ['jwt', 'token', 'create', 'generate', '生成', '令牌', '认证', 'header', 'payload'],
};
