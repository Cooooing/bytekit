import { useEffect, type ReactNode } from 'react';
import { ThemeProvider } from './ThemeContext';
import { AppMessageProvider } from '../components/shared/ui/AppMessage';

interface ThemeManagerProps {
	children: ReactNode;
}

export default function ThemeManager({ children }: ThemeManagerProps) {
	useEffect(() => {
		document.documentElement.dataset.themeId = 'radix-tailwind';
	}, []);

	return (
		<ThemeProvider>
			<AppMessageProvider>{children}</AppMessageProvider>
		</ThemeProvider>
	);
}
