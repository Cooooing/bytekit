import { useState, useEffect, type ReactNode } from 'react';
import { ThemeProvider } from './ThemeContext';

const THEME_KEY = 'bytekit-theme-id';

function readTheme(): string {
	if (typeof window === 'undefined') return 'default';
	try {
		return localStorage.getItem(THEME_KEY) || 'default';
	} catch {
		return 'default';
	}
}

interface ThemeManagerProps {
	children: ReactNode;
}

export default function ThemeManager({ children }: ThemeManagerProps) {
	const [themeId, setThemeId] = useState(readTheme);

	useEffect(() => {
		try {
			localStorage.setItem(THEME_KEY, themeId);
		} catch {
			// localStorage may be unavailable (Safari private browsing, etc.)
		}
		document.documentElement.dataset.themeId = themeId;
	}, [themeId]);

	// Listen for theme change events from ThemeSelector
	useEffect(() => {
		const handler = (e: Event) => {
			const customEvent = e as CustomEvent<string>;
			setThemeId(customEvent.detail);
		};
		window.addEventListener('bytekit:change-theme', handler);
		return () => window.removeEventListener('bytekit:change-theme', handler);
	}, []);

	return <ThemeProvider themeId={themeId}>{children}</ThemeProvider>;
}
