import { useState, useRef, useEffect } from 'react';
import { getAvailableThemes } from '../../ThemeContext';

interface ThemeSelectorProps {
	currentTheme: string;
	onThemeChange: (themeId: string) => void;
}

export default function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const themes = getAvailableThemes();

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
		}
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, []);

	return (
		<div ref={ref} className="theme-selector">
			<button
				className="ui-button ui-button--ghost ui-button--sm theme-toggle"
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				aria-label="切换主题"
				title="切换主题"
			>
				🎨
			</button>
			{isOpen && (
				<div className="theme-selector__dropdown">
					{themes.map((t) => (
						<button
							key={t.id}
							className={`theme-selector__item${t.id === currentTheme ? ' theme-selector__item--active' : ''}`}
							type="button"
							onClick={() => { onThemeChange(t.id); setIsOpen(false); }}
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
