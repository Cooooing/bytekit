import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ThemeComponents } from './types';
import defaultThemeComponents from './default';
import { themeRegistry } from './registry';
import { readThemeId, THEME_KEY } from './constants';

const ThemeCtx = createContext<ThemeComponents>(defaultThemeComponents as ThemeComponents);
const defaultThemeId = 'default';
const changeThemeEventName = 'bytekit:change-theme';

function persistThemeId(themeId: string) {
	try {
		localStorage.setItem(THEME_KEY, themeId);
	} catch {
		// 受限浏览环境可能禁用 localStorage，主题切换仍应在当前页面生效。
	}
}

export function useTheme(): ThemeComponents {
	return useContext(ThemeCtx);
}

interface ThemeProviderProps {
	children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
	const [components, setComponents] = useState<ThemeComponents>(defaultThemeComponents as ThemeComponents);

	useEffect(() => {
		let active = true;

		async function applyTheme(themeId: string, persist = false) {
			const normalizedThemeId = themeRegistry[themeId] ? themeId : defaultThemeId;
			try {
				const themeModule = await themeRegistry[normalizedThemeId].components();
				if (!active) return;
				setComponents(themeModule.default);
				document.documentElement.dataset.themeId = normalizedThemeId;
				if (persist) persistThemeId(normalizedThemeId);
			} catch {
				if (!active) return;
				setComponents(defaultThemeComponents as ThemeComponents);
				document.documentElement.dataset.themeId = defaultThemeId;
				if (persist) persistThemeId(defaultThemeId);
			}
		}

		function handleThemeChange(event: Event) {
			const themeId = (event as CustomEvent<string>).detail;
			applyTheme(themeId, true);
		}

		applyTheme(readThemeId());
		window.addEventListener(changeThemeEventName, handleThemeChange);
		return () => {
			active = false;
			window.removeEventListener(changeThemeEventName, handleThemeChange);
		};
	}, []);

	const value = useMemo(() => components, [components]);
	return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function getAvailableThemes() {
	return Object.values(themeRegistry).map(({ id, name, description }) => ({ id, name, description }));
}
