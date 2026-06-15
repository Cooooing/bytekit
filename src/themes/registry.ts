import type { ThemeDefinition } from './types';

export const themeRegistry: Record<string, ThemeDefinition> = {
	default: {
		id: 'default',
		name: '默认',
		description: '现代简洁风格，CodeMirror 编辑器',
		components: () => import('./default'),
	},
};
