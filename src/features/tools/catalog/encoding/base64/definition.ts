import type { ToolDefinition, ToolCategory } from '../../types';

export const category: ToolCategory = {
	id: 'encoding',
	name: '编码/解码',
	description: '常见文本编码、解码和格式转换。',
	icon: 'code',
};

export const definition: ToolDefinition = {
	id: 'base64',
	href: 'tools/encoding/base64',
	name: 'Base64 编解码',
	shortName: 'Base64',
	description: '处理 UTF-8 文本的 Base64 编码和解码。',
	category: 'encoding',
	keywords: ['base64', 'encode', 'decode', '编码', '解码', '编解码', 'b64'],
};
