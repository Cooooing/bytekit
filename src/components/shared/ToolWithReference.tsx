import type { ReactNode } from 'react';
import { useRefPanel } from './layouts/RefPanelContext';
import type { RefContent } from './layouts/RefPanelContext';

interface ToolWithReferenceProps {
	main: ReactNode;
	reference: ReactNode;
}

/**
 * @deprecated Reference content is now rendered in the right sidebar by AppShell.
 * Use useRefPanel() in your tool component to register reference content directly.
 * This wrapper is kept for backward compatibility but ignores the reference prop.
 */
export default function ToolWithReference({ main }: ToolWithReferenceProps) {
	return <div className="tool-with-ref__main">{main}</div>;
}
