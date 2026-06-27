import type { ReactNode } from 'react';
import { ThemeProvider } from './ThemeContext';
import { AppMessageProvider } from '@shared/ui/AppMessage';

interface ThemeManagerProps {
	children: ReactNode;
}

export default function ThemeManager({ children }: ThemeManagerProps) {
	return (
		<ThemeProvider>
			<AppMessageProvider>{children}</AppMessageProvider>
		</ThemeProvider>
	);
}
