import { useState, type ReactNode } from 'react';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';

interface ToolWithReferenceProps {
	main: ReactNode;
	reference: ReactNode;
}

export default function ToolWithReference({ main, reference }: ToolWithReferenceProps) {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<>
			<div className={`tool-with-ref${collapsed ? ' tool-with-ref--collapsed' : ''}`}>
				<div className="tool-with-ref__main">{main}</div>
				{!collapsed && (
					<div className="tool-with-ref__ref">
						<button
							className="tool-with-ref__toggle"
							type="button"
							onClick={() => setCollapsed(true)}
							aria-label="收起参考面板"
							title="收起参考"
						>
							<PanelRightClose size={14} strokeWidth={2} />
						</button>
						{reference}
					</div>
				)}
			</div>
			{collapsed && (
				<button
					className="tool-with-ref__toggle-float"
					type="button"
					onClick={() => setCollapsed(false)}
					aria-label="展开参考面板"
					title="展开参考"
				>
					<PanelRightOpen size={14} strokeWidth={2} />
				</button>
			)}
		</>
	);
}
