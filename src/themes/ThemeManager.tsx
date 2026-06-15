import { useState, useEffect } from 'react';
import ThemeSelector from './default/components/ThemeSelector';

const THEME_KEY = 'bytekit-theme-id';

function readTheme(): string {
	if (typeof window === 'undefined') return 'default';
	try {
		return window.localStorage.getItem(THEME_KEY) ?? 'default';
	} catch {
		return 'default';
	}
}

export default function ThemeManager() {
	const [themeId, setThemeId] = useState(readTheme);

	useEffect(() => {
		window.localStorage.setItem(THEME_KEY, themeId);
		document.documentElement.dataset.themeId = themeId;
	}, [themeId]);

	return <ThemeSelector currentTheme={themeId} onThemeChange={setThemeId} />;
}
