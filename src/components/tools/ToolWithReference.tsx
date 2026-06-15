import type { ReactNode } from 'react';

interface ToolWithReferenceProps {
	main: ReactNode;
	reference: ReactNode;
}

export default function ToolWithReference({ main, reference }: ToolWithReferenceProps) {
	return (
		<div className="tool-with-ref">
			<div className="tool-with-ref__main">{main}</div>
			<div className="tool-with-ref__ref">{reference}</div>
		</div>
	);
}
