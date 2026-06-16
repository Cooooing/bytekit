import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../themes/ThemeContext';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
	if (typeof window === 'undefined') return 'light';
	const current = document.documentElement.dataset.theme;
	return current === 'dark' ? 'dark' : 'light';
}

export default function ThemeToggle() {
	const { Button } = useTheme();
	const [theme, setTheme] = useState<Theme>(getInitialTheme);

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
		window.localStorage.setItem('bytekit-theme', theme);
	}, [theme]);

	function toggleTheme() {
		setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
	}

	return (
		<Button
			variant="ghost"
			size="sm"
			className="theme-toggle"
			onClick={toggleTheme}
			aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
			title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
		>
			{theme === 'dark' ? <Moon size={17} strokeWidth={2} aria-hidden="true" /> : <Sun size={17} strokeWidth={2} aria-hidden="true" />}
		</Button>
	);
}
