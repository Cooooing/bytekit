import type { ReactNode } from 'react';
import FloatingPanel from './ui/FloatingPanel';

interface ToolWithReferenceProps {
	main: ReactNode;
	reference: ReactNode;
}

export default function ToolWithReference({ main, reference }: ToolWithReferenceProps) {
	return (
		<div className="tool-with-ref">
			<div className="tool-with-ref__main">{main}</div>
			<FloatingPanel side="right" title="参考">
				{reference}
			</FloatingPanel>
		</div>
	);
}
