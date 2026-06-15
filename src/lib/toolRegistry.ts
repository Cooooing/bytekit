export type ToolCategoryId = 'encoding' | 'crypto' | 'json';
export type ToolLayout = 'io' | 'single';

export interface ToolCategory {
	id: ToolCategoryId;
	name: string;
	description: string;
	icon: string;
}

export interface ToolDefinition {
	id: string;
	href: string;
	name: string;
	shortName: string;
	description: string;
	category: ToolCategoryId;
	keywords: string[];
	layout: ToolLayout;
}

export const toolCategories: ToolCategory[] = [
	{
		id: 'encoding',
		name: '编码/解码',
		description: '常见文本编码、解码和格式转换。',
		icon: 'code',
	},
	{
		id: 'crypto',
		name: '加密/安全',
		description: '令牌解析、密码生成和本地安全工具。',
		icon: 'lock',
	},
	{
		id: 'json',
		name: 'JSON 工具',
		description: 'JSON 格式化、压缩和结构处理。',
		icon: 'file-json',
	},
];

export const tools: ToolDefinition[] = [
	{
		id: 'json',
		href: 'tools/json',
		name: 'JSON 格式化',
		shortName: 'JSON',
		description: '格式化、压缩和校验 JSON 文本。',
		category: 'json',
		keywords: ['json', 'format', 'minify', '格式化', '压缩', '校验', '验证', 'pretty', 'beautify'],
		layout: 'io',
	},
	{
		id: 'jwt',
		href: 'tools/jwt',
		name: 'JWT 解析',
		shortName: 'JWT',
		description: '解析 header 和 payload，不执行签名校验。',
		category: 'crypto',
		keywords: ['jwt', 'token', 'header', 'payload', '令牌', '解码', 'decode'],
		layout: 'io',
	},
	{
		id: 'base64',
		href: 'tools/base64',
		name: 'Base64 编解码',
		shortName: 'Base64',
		description: '处理 UTF-8 文本的 Base64 编码和解码。',
		category: 'encoding',
		keywords: ['base64', 'encode', 'decode', '编码', '解码', '编解码', 'b64'],
		layout: 'io',
	},
	{
		id: 'password',
		href: 'tools/password',
		name: '随机密码',
		shortName: '密码',
		description: '按长度和字符集生成随机密码。',
		category: 'crypto',
		keywords: ['password', 'random', 'generate', '密码', '随机', '生成', '密码生成', 'pin'],
		layout: 'single',
	},
];

export function getToolById(id: string) {
	return tools.find((tool) => tool.id === id);
}

export function getCategoryById(id: ToolCategoryId) {
	return toolCategories.find((category) => category.id === id);
}

export function getToolsByCategory(id: ToolCategoryId) {
	return tools.filter((tool) => tool.category === id);
}

// Get the full href with base URL prefix (works across all platforms)
export function getToolHref(tool: ToolDefinition): string {
	return import.meta.env.BASE_URL + tool.href;
}

// Extract tool ID from a full URL pathname
export function getToolIdFromPathname(pathname: string): string {
	const base = import.meta.env.BASE_URL;
	const relative = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
	const match = relative.match(/^tools\/([^/]+)/);
	return match?.[1] ?? '';
}

// Check if a pathname is under the tools section
export function isToolPath(pathname: string): boolean {
	return pathname.startsWith(import.meta.env.BASE_URL + 'tools/');
}
