import type { ToolDefinition, ToolCategory } from '../../types';

export const category: ToolCategory = {
	id: 'json',
	name: 'JSON 工具',
	description: 'JSON 格式化、压缩和结构处理。',
	icon: 'file-json',
};

export const definition: ToolDefinition = {
	id: 'json',
	href: 'tools/json/format',
	name: 'JSON 格式化',
	shortName: 'JSON',
	description: '格式化、压缩和校验 JSON 文本。',
	category: 'json',
	keywords: ['json', 'format', 'minify', '格式化', '压缩', '校验', '验证', 'pretty', 'beautify'],
};
