import { Button as AnimalButton } from 'animal-island-ui';
import type { ButtonProps } from '@shared/ui/Button';

const typeMap: Record<NonNullable<ButtonProps['variant']>, string> = {
	primary: 'primary',
	secondary: 'default',
	ghost: 'text',
	danger: 'primary',
};

const sizeMap: Record<NonNullable<ButtonProps['size']>, string> = {
	sm: 'small',
	md: 'middle',
	icon: 'small',
};

export default function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
	return (
		<AnimalButton
			type={typeMap[variant]}
			size={sizeMap[size]}
			className={className}
			{...props}
		>
			{children}
		</AnimalButton>
	);
}
