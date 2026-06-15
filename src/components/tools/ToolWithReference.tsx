import { useState, type ReactNode } from 'react';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';

interface ToolWithReferenceProps {
	main: ReactNode;
	reference: ReactNode;
}

export default function ToolWithReference({ main, reference }: ToolWithReferenceProps) {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<div className={`tool-with-ref${collapsed ? ' tool-with-ref--collapsed' : ''}`}>
			<div className="tool-with-ref__main">{main}</div>
			<div className="tool-with-ref__ref">
				<button
					className="tool-with-ref__toggle"
					type="button"
					onClick={() => setCollapsed(!collapsed)}
					aria-label={collapsed ? '展开参考面板' : '收起参考面板'}
					title={collapsed ? '展开参考' : '收起参考'}
				>
					{collapsed ? <PanelRightOpen size={14} strokeWidth={2} /> : <PanelRightClose size={14} strokeWidth={2} />}
				</button>
				{!collapsed && reference}
			</div>
		</div>
	);
}
