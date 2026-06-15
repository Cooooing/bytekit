import type { ReactNode } from 'react';

interface IoWorkbenchProps {
	input: ReactNode;
	actions: ReactNode;
	output: ReactNode;
	ariaLabel: string;
}

interface GeneratorPanelProps {
	controls: ReactNode;
	result: ReactNode;
	actions?: ReactNode;
	reference?: ReactNode;
	ariaLabel: string;
}

export function IoWorkbench({ input, actions, output, ariaLabel }: IoWorkbenchProps) {
	return (
		<section className="io-workbench" aria-label={ariaLabel}>
			<div className="io-workbench__toolbar" aria-label="操作">
				{actions}
			</div>
			<div className="io-workbench__panes">
				<div className="io-workbench__pane io-workbench__pane--input">{input}</div>
				<div className="io-workbench__pane io-workbench__pane--output">{output}</div>
			</div>
		</section>
	);
}

export function GeneratorPanel({ controls, result, actions, reference, ariaLabel }: GeneratorPanelProps) {
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
