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
}

export default function ReferencePanel({ title, sections }: ReferencePanelProps) {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<div className="ref-panel">
			<button
				className="ref-panel__toggle"
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				aria-expanded={isOpen}
			>
				<span className="ref-panel__title">{title}</span>
				<span className="ref-panel__arrow">{isOpen ? '▼' : '▶'}</span>
			</button>
			<div className={`ref-panel__body${isOpen ? '' : ' ref-panel__body--collapsed'}`}>
				{sections.map((section) => (
					<div key={section.title} className="ref-section">
						<h3 className="ref-section__title">{section.title}</h3>
						<div className="ref-section__items">
							{section.items.map((item) => (
								<div key={item.syntax} className="ref-item">
									<code className="ref-item__syntax">{item.syntax}</code>
									<span className="ref-item__desc">{item.desc}</span>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
