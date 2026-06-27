import type { ToolDefinition, ToolCategory } from '../../types';

export const category: ToolCategory = {
	id: 'text',
	name: '文本处理',
	description: '正则测试、大小写转换、Markdown 预览等。',
	icon: 'file-text',
};

export const definition: ToolDefinition = {
	id: 'color',
	href: 'tools/text/color',
	name: '颜色转换',
	shortName: '颜色',
	description: 'HEX、RGB、HSL 颜色格式互转，实时预览。',
	category: 'text',
	keywords: ['color', 'hex', 'rgb', 'hsl', '颜色', '色彩', '拾色器'],
};
