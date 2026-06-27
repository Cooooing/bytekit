import type { ComponentType } from 'react';
import type { ButtonProps } from '@shared/ui/Button';

export interface ThemeComponents {
	Button: ComponentType<ButtonProps>;
}

export interface ThemeDefinition {
	id: string;
	name: string;
	description: string;
	components: () => Promise<{ default: ThemeComponents }>;
}
