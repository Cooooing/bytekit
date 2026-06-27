import { PanelRightClose, PanelRightOpen } from 'lucide-react';

interface ReferenceItem {
	syntax: string;
	desc: string;
}

interface ReferenceSection {
	title: string;
	items: ReferenceItem[];
}

interface ReferencePanelProps {
	title: string;
	sections: ReferenceSection[];
	collapsed?: boolean;
	onToggleCollapse?: () => void;
}

export default function ReferencePanel({ title, sections, collapsed, onToggleCollapse }: ReferencePanelProps) {
	const isCollapsed = collapsed ?? false;

	if (isCollapsed) {
		return (
			<button
				className="ref-panel ref-panel--collapsed ref-panel__rail-toggle"
				type="button"
				onClick={onToggleCollapse}
				aria-label="展开参考面板"
				title="展开参考面板"
			>
				<PanelRightOpen size={17} strokeWidth={2.2} aria-hidden="true" />
			</button>
		);
	}

	return (
		<div className="ref-panel">
			<button
				className="ref-panel__header"
				type="button"
				onClick={onToggleCollapse}
				aria-label="收起参考面板"
				title="收起参考面板"
			>
				<span className="ref-panel__title-bar">
					<span className="ref-panel__title">{title}</span>
				</span>
				<span className="ref-panel__dock-toggle" aria-hidden="true">
					<PanelRightClose size={16} strokeWidth={2.2} aria-hidden="true" />
				</span>
			</button>
			<div className="ref-panel__body">
				{sections.map((section) => (
					<section key={section.title} className="ref-section">
						<h3 className="ref-section__title">{section.title}</h3>
						<div className="ref-section__items">
							{section.items.map((item, index) => (
								<div key={`${section.title}-${item.syntax}-${index}`} className="ref-item">
									<code className="ref-item__syntax">{item.syntax}</code>
									<span className="ref-item__desc">{item.desc}</span>
								</div>
							))}
						</div>
					</section>
				))}
			</div>
		</div>
	);
}
