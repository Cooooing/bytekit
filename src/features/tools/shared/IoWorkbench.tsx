import type { ReactNode } from 'react';

interface IoWorkbenchProps {
	input: ReactNode;
	actions: ReactNode;
	output: ReactNode;
	ariaLabel: string;
}

export default function IoWorkbench({ input, actions, output, ariaLabel }: IoWorkbenchProps) {
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
