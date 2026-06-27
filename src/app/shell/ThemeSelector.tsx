import { useState, useRef, useEffect } from 'react';
import { Paintbrush } from 'lucide-react';
import { getAvailableThemes } from '@themes/ThemeContext';
import { readThemeId } from '@themes/constants';

export default function ThemeSelector() {
	const [isOpen, setIsOpen] = useState(false);
	const [currentTheme, setCurrentTheme] = useState(() => {
		if (typeof document === 'undefined') return 'default';
		return document.documentElement.dataset.themeId || readThemeId();
	});
	const ref = useRef<HTMLDivElement>(null);
	const themes = getAvailableThemes();
	const dropdownId = 'theme-selector-menu';

	useEffect(() => {
		setCurrentTheme(document.documentElement.dataset.themeId || readThemeId());
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
				aria-expanded={isOpen}
				aria-haspopup="menu"
				aria-controls={dropdownId}
				title="切换主题"
			>
				<Paintbrush size={17} strokeWidth={2} aria-hidden="true" />
			</button>
			{isOpen && (
				<div id={dropdownId} className="theme-selector__dropdown" role="menu">
					{themes.map((t) => (
						<button
							key={t.id}
							className={`theme-selector__item${t.id === currentTheme ? ' theme-selector__item--active' : ''}`}
							type="button"
							onClick={() => handleThemeChange(t.id)}
							role="menuitemradio"
							aria-checked={t.id === currentTheme}
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
