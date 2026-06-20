import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../themes/ThemeContext';
import { THEME_KEY_VISUAL } from '../../themes/constants';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
	if (typeof window === 'undefined') return 'light';
	const current = document.documentElement.dataset.theme;
	return current === 'dark' ? 'dark' : 'light';
}

export default function ThemeToggle() {
	const { Button } = useTheme();
	const [theme, setTheme] = useState<Theme>('light');
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setTheme(getInitialTheme());
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (!isMounted) return;
		document.documentElement.dataset.theme = theme;
		try {
			window.localStorage.setItem(THEME_KEY_VISUAL, theme);
		} catch {
			// localStorage may be unavailable in restricted browsing contexts.
		}
	}, [isMounted, theme]);

	function toggleTheme() {
		setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
	}

	const label = theme === 'dark' ? '切换到浅色模式' : '切换到深色模式';

	return (
		<Button
			variant="ghost"
			size="sm"
			className="theme-toggle"
			onClick={toggleTheme}
			aria-label={label}
			title={label}
		>
			{theme === 'dark' ? <Moon size={17} strokeWidth={2} aria-hidden="true" /> : <Sun size={17} strokeWidth={2} aria-hidden="true" />}
		</Button>
	);
}
