import type { ToolDefinition } from '../../types';

export const definition: ToolDefinition = {
	id: 'diff',
	href: 'tools/text/diff',
	name: '文本差异对比',
	shortName: '对比',
	description: '逐行对比两段文本，高亮差异。',
	category: 'text',
	keywords: ['diff', 'compare', '对比', '差异', '比较'],
};
