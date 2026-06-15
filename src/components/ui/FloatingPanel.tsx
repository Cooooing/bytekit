import { useState, useEffect, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, PanelRightClose, PanelRightOpen } from 'lucide-react';

type PanelSide = 'left' | 'right';

interface FloatingPanelProps {
	side: PanelSide;
	title: string;
	children: ReactNode;
	collapsedKey?: string; // localStorage key for persistence
}

export default function FloatingPanel({ side, title, children, collapsedKey }: FloatingPanelProps) {
	const [collapsed, setCollapsed] = useState(() => {
		if (!collapsedKey || typeof window === 'undefined') return false;
		try {
			return localStorage.getItem(collapsedKey) === 'true';
		} catch {
			return false;
		}
	});

	useEffect(() => {
		if (collapsedKey) {
			try {
				localStorage.setItem(collapsedKey, String(collapsed));
			} catch {
				// ignore
			}
		}
	}, [collapsed, collapsedKey]);

	const baseClass = side === 'left' ? 'fp' : 'fp fp--right';
	const stateClass = collapsed ? `${baseClass} fp--collapsed` : baseClass;

	if (collapsed) {
		const Icon = side === 'left' ? ChevronRight : PanelRightOpen;
		const floatClass = side === 'left' ? 'fp__float fp__float--left' : 'fp__float fp__float--right';
		return (
			<button
				className={floatClass}
				type="button"
				onClick={() => setCollapsed(false)}
				aria-label={`展开${title}`}
				title={`展开${title}`}
			>
				<Icon size={16} strokeWidth={2} />
			</button>
		);
	}

	const CloseIcon = side === 'left' ? ChevronLeft : PanelRightClose;

	return (
		<div className={stateClass} aria-label={title}>
			<button
				className="fp__head"
				type="button"
				onClick={() => setCollapsed(true)}
				aria-label={`收起${title}`}
				title={`收起${title}`}
			>
				<span className="fp__title">{title}</span>
				<CloseIcon size={14} strokeWidth={2.5} />
			</button>
			<div className="fp__body">{children}</div>
		</div>
	);
}
