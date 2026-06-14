import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'success' | 'danger' | 'warning' | 'info';

interface BadgeProps {
	tone?: BadgeTone;
	children: ReactNode;
	className?: string;
}

export default function Badge({ tone = 'neutral', children, className }: BadgeProps) {
	const classes = ['ui-badge', `ui-badge--${tone}`, className].filter(Boolean).join(' ');
	return <span className={classes}>{children}</span>;
}
