import { Button as AnimalButton } from 'animal-island-ui';
import type { ButtonProps } from '../../types';

const typeMap: Record<string, string> = {
	primary: 'primary',
	secondary: 'default',
	ghost: 'text',
};

const sizeMap: Record<string, string> = {
	sm: 'small',
	md: 'middle',
};

export default function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
	return (
		<AnimalButton
			type={typeMap[variant] as any}
			size={sizeMap[size] as any}
			className={className}
			{...props}
		>
			{children}
		</AnimalButton>
	);
}
