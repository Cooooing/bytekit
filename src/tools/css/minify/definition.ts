import type { ToolDefinition, ToolCategory } from '../../types';

export const category: ToolCategory = {
	id: 'css',
	name: 'CSS 工具',
	description: 'CSS 压缩、美化和格式化。',
	icon: 'palette',
};

export const definition: ToolDefinition = {
	id: 'css-minify',
	href: 'tools/css/minify',
	name: 'CSS 压缩/美化',
	shortName: 'CSS',
	description: 'CSS 代码格式化和压缩。',
	category: 'css',
	keywords: ['css', 'minify', 'beautify', 'format', '压缩', '美化', '格式化'],
};
