import { useState, useRef, useEffect } from 'react';
import { Paintbrush } from 'lucide-react';
import { getAvailableThemes } from '../../ThemeContext';

const THEME_KEY = 'bytekit-theme-id';

function readCurrentTheme(): string {
	try {
		return localStorage.getItem(THEME_KEY) || 'default';
	} catch {
		return 'default';
	}
}

export default function ThemeSelector() {
	const [isOpen, setIsOpen] = useState(false);
	const [currentTheme, setCurrentTheme] = useState(readCurrentTheme);
	const ref = useRef<HTMLDivElement>(null);
	const themes = getAvailableThemes();

	// Sync with ThemeManager when theme changes (e.g., from another source)
	useEffect(() => {
		const handler = (e: Event) => {
			setCurrentTheme((e as CustomEvent<string>).detail);
		};
		window.addEventListener('bytekit:change-theme', handler);
		return () => window.removeEventListener('bytekit:change-theme', handler);
	}, []);

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
		}
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, []);

	function handleThemeChange(themeId: string) {
		setCurrentTheme(themeId);
		// ThemeManager handles localStorage and dataset writes
		window.dispatchEvent(new CustomEvent('bytekit:change-theme', { detail: themeId }));
		setIsOpen(false);
	}

	return (
		<div ref={ref} className="theme-selector">
			<button
				className="ui-button ui-button--ghost ui-button--sm theme-toggle"
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				aria-label="切换主题"
				title="切换主题"
			>
				<Paintbrush size={17} strokeWidth={2} aria-hidden="true" />
			</button>
			{isOpen && (
				<div className="theme-selector__dropdown">
					{themes.map((t) => (
						<button
							key={t.id}
							className={`theme-selector__item${t.id === currentTheme ? ' theme-selector__item--active' : ''}`}
							type="button"
							onClick={() => handleThemeChange(t.id)}
						>
							<span className="theme-selector__name">{t.name}</span>
							<span className="theme-selector__desc">{t.description}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
