import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[color-mix(in_srgb,var(--primary)_26%,transparent)] disabled:pointer-events-none disabled:opacity-55',
	{
		variants: {
			variant: {
				primary: 'bg-[var(--primary)] text-[var(--button-primary-text)] hover:bg-[var(--primary-strong)]',
				secondary: 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-muted)]',
				ghost: 'bg-transparent text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]',
				danger: 'bg-[var(--danger)] text-[var(--text-inverse)] hover:bg-[color-mix(in_srgb,var(--danger)_86%,black)]',
			},
			size: {
				sm: 'min-h-[1.875rem] px-2 text-[0.8125rem]',
				md: 'min-h-[2.375rem] px-3 text-[0.875rem]',
				icon: 'h-[2.375rem] w-[2.375rem] px-0',
			},
		},
		defaultVariants: {
			variant: 'primary',
			size: 'md',
		},
	},
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
	children: ReactNode;
}

export default function Button({ variant, size, className, children, type = 'button', ...props }: ButtonProps) {
	return (
		<button className={cn(buttonVariants({ variant, size }), className)} type={type} {...props}>
			{children}
		</button>
	);
}
