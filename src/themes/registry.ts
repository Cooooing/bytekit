import type { ThemeDefinition } from './types';

export const themeRegistry: Record<string, ThemeDefinition> = {
	default: {
		id: 'default',
		name: '默认',
		description: '现代简洁风格，CodeMirror 编辑器',
		components: () => import('./default'),
	},
	'animal-island': {
		id: 'animal-island',
		name: 'Animal Island',
		description: '自然暖色风格，圆润可爱的设计语言',
		components: () => import('./animal-island'),
	},
};
