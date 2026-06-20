import { createContext, useContext, type ReactNode } from 'react';
import type { ThemeComponents } from './types';
import defaultThemeComponents from './default';

const ThemeCtx = createContext<ThemeComponents>(defaultThemeComponents as ThemeComponents);

export function useTheme(): ThemeComponents {
	return useContext(ThemeCtx);
}

interface ThemeProviderProps {
	children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
	return <ThemeCtx.Provider value={defaultThemeComponents as ThemeComponents}>{children}</ThemeCtx.Provider>;
}

export function getAvailableThemes() {
	return [
		{ id: 'light', name: '浅色', description: '专业工具台浅色主题' },
		{ id: 'dark', name: '深色', description: '专业工具台深色主题' },
	];
}
