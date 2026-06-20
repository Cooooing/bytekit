import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown, ChevronLeft, ChevronRight, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { useState } from 'react';

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
	const [isOpen, setIsOpen] = useState(true);
	const isCollapsed = collapsed ?? false;

	if (isCollapsed) {
		return (
			<div className="ref-panel ref-panel--collapsed">
				<button
					className="ref-panel__rail-toggle"
					type="button"
					onClick={onToggleCollapse}
					aria-label="展开参考面板"
					title="展开参考面板"
				>
					<ChevronLeft size={17} strokeWidth={2.2} aria-hidden="true" />
					<span>参考</span>
				</button>
			</div>
		);
	}

	return (
		<Collapsible.Root className="ref-panel" open={isOpen} onOpenChange={setIsOpen}>
			<div className="ref-panel__header">
				<Collapsible.Trigger className="ref-panel__toggle" aria-label={isOpen ? '收起参考内容' : '展开参考内容'}>
					<span className="ref-panel__title">{title}</span>
					{isOpen ? <ChevronDown size={17} strokeWidth={2.2} aria-hidden="true" /> : <ChevronRight size={17} strokeWidth={2.2} aria-hidden="true" />}
				</Collapsible.Trigger>
				<button
					className="ref-panel__dock-toggle"
					type="button"
					onClick={onToggleCollapse}
					aria-label="收起参考面板"
					title="收起参考面板"
				>
					{isOpen ? <PanelRightClose size={16} strokeWidth={2.2} aria-hidden="true" /> : <PanelRightOpen size={16} strokeWidth={2.2} aria-hidden="true" />}
				</button>
			</div>
			<Collapsible.Content className="ref-panel__body">
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
			</Collapsible.Content>
		</Collapsible.Root>
	);
}
