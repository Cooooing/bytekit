import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	children: ReactNode;
}

export default function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
	const classes = ['ui-button', `ui-button--${variant}`, `ui-button--${size}`, className].filter(Boolean).join(' ');
	return <button className={classes} type="button" {...props}>{children}</button>;
}
