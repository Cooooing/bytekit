import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getToolsByCategory, toolCategories, tools } from '../../../tools/registry';

interface ToolSidebarProps {
	activeToolId: string;
	onSelectTool: (toolId: string) => void;
}

type OpenState = Record<string, boolean>;

function readOpenState(): OpenState {
	return {};
}

function readCollapsed() {
	return false;
}

export default function ToolSidebar({ activeToolId, onSelectTool }: ToolSidebarProps) {
	const [openState, setOpenState] = useState<OpenState>(readOpenState);
	const [collapsed, setCollapsed] = useState(readCollapsed);
	const sidebarRef = useRef<HTMLElement | null>(null);
	const activeTool = tools.find((tool) => tool.id === activeToolId);

	const normalizedOpenState = useMemo(() => {
		const next: OpenState = {};
		for (const category of toolCategories) {
			next[category.id] = category.id === activeTool?.category || (openState[category.id] ?? false);
		}
		return next;
	}, [activeTool?.category, openState]);

	useEffect(() => {
		try {
			const stored = window.localStorage.getItem('bytekit:tool-nav:collapsed:v1');
			if (stored === 'true') setCollapsed(true);
			const openStored = window.localStorage.getItem('bytekit:tool-nav:open:v1');
			if (openStored) setOpenState(JSON.parse(openStored));
		} catch {}
	}, []);

	useEffect(() => {
		window.localStorage.setItem('bytekit:tool-nav:open:v1', JSON.stringify(normalizedOpenState));
	}, [normalizedOpenState]);

	useEffect(() => {
		window.localStorage.setItem('bytekit:tool-nav:collapsed:v1', String(collapsed));
	}, [collapsed]);

	useEffect(() => {
		const sidebar = sidebarRef.current;
		if (!sidebar || !window.matchMedia('(max-width: 900px)').matches) return;
		const frame = window.requestAnimationFrame(() => {
			const activeLink = sidebar.querySelector<HTMLElement>('.tool-sidebar__link--active');
			activeLink?.scrollIntoView({ block: 'nearest', inline: 'center' });
		});
		return () => window.cancelAnimationFrame(frame);
	}, [activeToolId, collapsed, normalizedOpenState]);

	function toggleCategory(categoryId: string) {
		setOpenState((current) => ({ ...current, [categoryId]: !normalizedOpenState[categoryId] }));
	}

	return (
		<aside ref={sidebarRef} className={collapsed ? 'tool-sidebar tool-sidebar--collapsed' : 'tool-sidebar'} aria-label="工具目录">
			<button
				className="tool-sidebar__head"
				type="button"
				onClick={() => setCollapsed((value) => !value)}
				aria-label={collapsed ? '展开工具目录' : '收起工具目录'}
				title={collapsed ? '展开工具目录' : '收起工具目录'}
			>
				{collapsed ? null : <span className="tool-sidebar__title">工具目录</span>}
				{collapsed ? (
					<PanelLeftOpen size={17} strokeWidth={2.2} className="tool-sidebar__chevron" aria-hidden="true" />
				) : (
					<PanelLeftClose size={17} strokeWidth={2.2} className="tool-sidebar__chevron" aria-hidden="true" />
				)}
			</button>

			<div className="tool-sidebar__groups">
				{toolCategories.map((category) => {
					const categoryTools = getToolsByCategory(category.id);
					if (categoryTools.length === 0) return null;
					const isOpen = normalizedOpenState[category.id];

					return (
						<section className="tool-sidebar__group" key={category.id}>
							<button className="tool-sidebar__group-toggle" type="button" onClick={() => toggleCategory(category.id)}>
								<span>{category.name}</span>
								<ChevronDown
									size={14}
									strokeWidth={2}
									style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s ease' }}
								/>
							</button>
							{isOpen ? (
								<div className="tool-sidebar__links">
									{categoryTools.map((tool) => (
										<button
											key={tool.id}
											className={tool.id === activeToolId ? 'tool-sidebar__link tool-sidebar__link--active' : 'tool-sidebar__link'}
											type="button"
											onClick={() => onSelectTool(tool.id)}
										>
											{tool.name}
										</button>
									))}
								</div>
							) : null}
						</section>
					);
				})}
			</div>
		</aside>
	);
}
