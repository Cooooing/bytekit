import type { ReactNode } from 'react';

interface GeneratorPanelProps {
	controls: ReactNode;
	result: ReactNode;
	actions?: ReactNode;
	reference?: ReactNode;
	ariaLabel: string;
}

export default function GeneratorPanel({ controls, result, actions, reference, ariaLabel }: GeneratorPanelProps) {
	return (
		<section className="generator-panel" aria-label={ariaLabel}>
			<div className="generator-panel__controls">{controls}</div>
			<div className="generator-panel__right">
				<div className="generator-panel__result">
					{result}
					{actions ? <div className="generator-panel__actions">{actions}</div> : null}
				</div>
				{reference ? <div className="generator-panel__reference">{reference}</div> : null}
			</div>
		</section>
	);
}
