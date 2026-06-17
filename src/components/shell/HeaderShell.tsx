import { useTheme } from '../../themes/ThemeContext';
import ThemeToggle from './ThemeToggle';

export default function HeaderShell() {
	const { ToolSearch, ThemeSelector } = useTheme();

	return (
		<header className="site-header">
			<div className="site-header__inner">
				<a className="brand" href={import.meta.env.BASE_URL} aria-label="Bytekit 首页">
					<span className="brand__mark">B</span>
					<span className="brand__body">
						<span className="brand__text">Bytekit</span>
						<span className="brand__caption">开发工具</span>
					</span>
				</a>
				<div className="site-header__search">
					<ToolSearch variant="header" />
				</div>
				<div className="site-header__actions">
					<ThemeSelector />
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
