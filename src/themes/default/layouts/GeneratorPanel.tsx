import type { ReactNode } from 'react';

export interface GeneratorPanelProps {
	controls: ReactNode;
	result: ReactNode;
	actions?: ReactNode;
	ariaLabel: string;
}

export default function GeneratorPanel({ controls, result, actions, ariaLabel }: GeneratorPanelProps) {
	return (
		<section className="generator-panel" aria-label={ariaLabel}>
			<div className="generator-panel__controls">{controls}</div>
			<div className="generator-panel__result">
				{result}
				{actions ? <div className="generator-panel__actions">{actions}</div> : null}
			</div>
		</section>
	);
}
