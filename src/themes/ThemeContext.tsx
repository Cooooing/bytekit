import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ThemeComponents } from './types';
import { themeRegistry } from './registry';

// ── Default theme loaded synchronously for first paint ──
import defaultThemeComponents from './default';

// ── Shared default components (theme-agnostic) ──
import SharedBadge from '../components/shared/ui/Badge';
import SharedCopyRow from '../components/shared/ui/CopyRow';
import SharedReferencePanel from '../components/shared/ui/ReferencePanel';
import SharedCodeEditor from '../components/shared/editor/CodeEditor';
import SharedIoWorkbench from '../components/shared/layouts/IoWorkbench';
import SharedGeneratorPanel from '../components/shared/layouts/GeneratorPanel';

const ThemeCtx = createContext<ThemeComponents>(
	defaultThemeComponents as ThemeComponents
);

export function useTheme(): ThemeComponents {
	return useContext(ThemeCtx);
}

// ── Component hooks with fallback to shared defaults ──

export function useBadge() {
	const theme = useContext(ThemeCtx);
	return theme.Badge ?? SharedBadge;
}

export function useCopyRow() {
	const theme = useContext(ThemeCtx);
	return theme.CopyRow ?? SharedCopyRow;
}

export function useReferencePanel() {
	const theme = useContext(ThemeCtx);
	return theme.ReferencePanel ?? SharedReferencePanel;
}

export function useCodeEditor() {
	const theme = useContext(ThemeCtx);
	return theme.CodeEditor ?? SharedCodeEditor;
}

export function useIoWorkbench() {
	const theme = useContext(ThemeCtx);
	return theme.IoWorkbench ?? SharedIoWorkbench;
}

export function useGeneratorPanel() {
	const theme = useContext(ThemeCtx);
	return theme.GeneratorPanel ?? SharedGeneratorPanel;
}

interface ThemeProviderProps {
	themeId: string;
	children: ReactNode;
}

export function ThemeProvider({ themeId, children }: ThemeProviderProps) {
	const [components, setComponents] = useState<ThemeComponents>(
		defaultThemeComponents as ThemeComponents
	);

	useEffect(() => {
		const theme = themeRegistry[themeId];
		if (!theme || themeId === 'default') {
			setComponents(defaultThemeComponents as ThemeComponents);
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
