export type ToolCategoryId = 'encoding' | 'crypto' | 'json' | 'developer' | 'text' | 'format' | 'css';
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
		id: 'developer',
		name: '开发工具',
		description: '时间戳、UUID、Hash 等常用开发辅助工具。',
		icon: 'settings',
	},
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
	{
		id: 'text',
		name: '文本处理',
		description: '正则测试、大小写转换、Markdown 预览等。',
		icon: 'file-text',
	},
	{
		id: 'format',
		name: '格式转换',
		description: 'JSON ↔ CSV、JSON ↔ YAML 等格式互转。',
		icon: 'braces',
	},
	{
		id: 'css',
		name: 'CSS 工具',
		description: 'CSS 压缩、美化和格式化。',
		icon: 'palette',
	},
];

export const tools: ToolDefinition[] = [
	{
		id: 'timestamp',
		href: 'tools/developer/timestamp',
		name: '时间戳转换',
		shortName: '时间戳',
		description: 'Unix 时间戳与日期时间互转，支持多时区。',
		category: 'developer',
		keywords: ['timestamp', 'unix', '时间戳', '日期', 'date', 'time', 'epoch'],
		layout: 'single',
	},
	{
		id: 'uuid',
		href: 'tools/developer/uuid',
		name: 'UUID 生成器',
		shortName: 'UUID',
		description: '一键生成 v4 随机 UUID。',
		category: 'developer',
		keywords: ['uuid', 'guid', 'unique', '生成', 'generate', '随机'],
		layout: 'single',
	},
	{
		id: 'hash',
		href: 'tools/developer/hash',
		name: 'Hash 生成器',
		shortName: 'Hash',
		description: '计算 MD5、SHA-1、SHA-256、SHA-512 哈希值。',
		category: 'developer',
		keywords: ['hash', 'md5', 'sha', 'sha256', 'sha512', '哈希', '摘要', 'digest'],
		layout: 'io',
	},
	{
		id: 'color',
		href: 'tools/text/color',
		name: '颜色转换',
		shortName: '颜色',
		description: 'HEX、RGB、HSL 颜色格式互转，实时预览。',
		category: 'text',
		keywords: ['color', 'hex', 'rgb', 'hsl', '颜色', '色彩', '拾色器'],
		layout: 'single',
	},
	{
		id: 'url',
		href: 'tools/encoding/url',
		name: 'URL 编解码',
		shortName: 'URL',
		description: 'URL 编码/解码及组件解析。',
		category: 'encoding',
		keywords: ['url', 'encode', 'decode', 'encodeuri', '编解码', '网址'],
		layout: 'io',
	},
	{
		id: 'regex',
		href: 'tools/text/regex',
		name: '正则表达式测试',
		shortName: '正则',
		description: '实时测试正则表达式，高亮匹配和分组。',
		category: 'text',
		keywords: ['regex', 'regexp', 'regular', 'expression', '正则', '匹配', 'pattern'],
		layout: 'io',
	},
	{
		id: 'diff',
		href: 'tools/text/diff',
		name: '文本差异对比',
		shortName: '对比',
		description: '逐行对比两段文本，高亮差异。',
		category: 'text',
		keywords: ['diff', 'compare', '对比', '差异', '比较'],
		layout: 'io',
	},
	{
		id: 'markdown',
		href: 'tools/text/markdown',
		name: 'Markdown 预览',
		shortName: 'MD',
		description: '实时 Markdown 渲染预览。',
		category: 'text',
		keywords: ['markdown', 'md', 'preview', '预览', '渲染'],
		layout: 'io',
	},
	{
		id: 'case',
		href: 'tools/text/case',
		name: '大小写转换',
		shortName: '大小写',
		description: 'camelCase/snake_case/kebab-case/PascalCase 互转。',
		category: 'text',
		keywords: ['case', 'camel', 'snake', 'kebab', 'pascal', '大小写', '命名', 'convert'],
		layout: 'io',
	},
	{
		id: 'csv',
		href: 'tools/format/csv',
		name: 'JSON ↔ CSV',
		shortName: 'CSV',
		description: 'JSON 数组与 CSV 表格互转。',
		category: 'format',
		keywords: ['json', 'csv', 'table', '表格', '转换', 'convert'],
		layout: 'io',
	},
	{
		id: 'yaml',
		href: 'tools/format/yaml',
		name: 'JSON ↔ YAML',
		shortName: 'YAML',
		description: 'JSON 和 YAML 格式互转。',
		category: 'format',
		keywords: ['json', 'yaml', 'yml', '转换', 'convert', '格式'],
		layout: 'io',
	},
	{
		id: 'css-minify',
		href: 'tools/css/minify',
		name: 'CSS 压缩/美化',
		shortName: 'CSS',
		description: 'CSS 代码格式化和压缩。',
		category: 'css',
		keywords: ['css', 'minify', 'beautify', 'format', '压缩', '美化', '格式化'],
		layout: 'io',
	},
	{
		id: 'json',
		href: 'tools/json/format',
		name: 'JSON 格式化',
		shortName: 'JSON',
		description: '格式化、压缩和校验 JSON 文本。',
		category: 'json',
		keywords: ['json', 'format', 'minify', '格式化', '压缩', '校验', '验证', 'pretty', 'beautify'],
		layout: 'io',
	},
	{
		id: 'jwt',
		href: 'tools/crypto/jwt',
		name: 'JWT 解析',
		shortName: 'JWT',
		description: '解析 header 和 payload，不执行签名校验。',
		category: 'crypto',
		keywords: ['jwt', 'token', 'header', 'payload', '令牌', '解码', 'decode'],
		layout: 'io',
	},
	{
		id: 'base64',
		href: 'tools/encoding/base64',
		name: 'Base64 编解码',
		shortName: 'Base64',
		description: '处理 UTF-8 文本的 Base64 编码和解码。',
		category: 'encoding',
		keywords: ['base64', 'encode', 'decode', '编码', '解码', '编解码', 'b64'],
		layout: 'io',
	},
	{
		id: 'password',
		href: 'tools/crypto/password',
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
	const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
	return base + tool.href;
}

// Extract tool ID from a full URL pathname (supports both old /tools/id and new /tools/category/id)
export function getToolIdFromPathname(pathname: string): string {
	const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
	const relative = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
	// Match tools/category/id pattern
	const match = relative.match(/^tools\/([^/]+)\/([^/]+)/);
	if (match) {
		// Find tool by href matching the category/id pattern
		const tool = tools.find((t) => t.href === `tools/${match[1]}/${match[2]}`);
		return tool?.id ?? match[2];
	}
	// Fallback: match tools/id pattern (backward compat)
	const legacyMatch = relative.match(/^tools\/([^/]+)/);
	return legacyMatch?.[1] ?? '';
}

// Check if a pathname is under the tools section
export function isToolPath(pathname: string): boolean {
	const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
	return pathname.startsWith(base + 'tools/');
}
