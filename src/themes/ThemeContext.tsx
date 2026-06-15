import { createContext, useContext, useState, useEffect, Suspense, type ReactNode } from 'react';
import type { ThemeComponents } from './types';
import { themeRegistry } from './registry';

// Default theme is loaded synchronously for first paint
import * as defaultComponents from './default';

const ThemeCtx = createContext<ThemeComponents>(defaultComponents as unknown as ThemeComponents);

export function useTheme(): ThemeComponents {
	return useContext(ThemeCtx);
}

interface ThemeProviderProps {
	themeId: string;
	children: ReactNode;
}

export function ThemeProvider({ themeId, children }: ThemeProviderProps) {
	const [components, setComponents] = useState<ThemeComponents>(defaultComponents as unknown as ThemeComponents);

	useEffect(() => {
		const theme = themeRegistry[themeId];
		if (!theme || themeId === 'default') {
			setComponents(defaultComponents as unknown as ThemeComponents);
			return;
		}

		theme.components().then((mod) => {
			setComponents(mod.default);
		});
	}, [themeId]);

	return <ThemeCtx.Provider value={components}>{children}</ThemeCtx.Provider>;
}

export function getAvailableThemes() {
	return Object.values(themeRegistry).map(({ id, name, description }) => ({ id, name, description }));
}
