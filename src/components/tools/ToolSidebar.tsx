import { ChevronLeft, ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getToolsByCategory, toolCategories, tools } from '../../lib/toolRegistry';

interface ToolSidebarProps {
	activeToolId: string;
	onSelectTool: (toolId: string) => void;
}

type OpenState = Record<string, boolean>;

function readOpenState(): OpenState {
	if (typeof window === 'undefined') return {};
	try {
		return JSON.parse(window.localStorage.getItem('bytekit:tool-nav:open:v1') ?? '{}');
	} catch {
		return {};
	}
}

function readCollapsed() {
	if (typeof window === 'undefined') return false;
	return window.localStorage.getItem('bytekit:tool-nav:collapsed:v1') === 'true';
}

export default function ToolSidebar({ activeToolId, onSelectTool }: ToolSidebarProps) {
	const [openState, setOpenState] = useState<OpenState>(readOpenState);
	const [collapsed, setCollapsed] = useState(readCollapsed);
	const activeTool = tools.find((tool) => tool.id === activeToolId);

	const normalizedOpenState = useMemo(() => {
		const next: OpenState = {};
		for (const category of toolCategories) {
			next[category.id] = openState[category.id] ?? category.id === activeTool?.category;
		}
		return next;
	}, [activeTool?.category, openState]);

	useEffect(() => {
		window.localStorage.setItem('bytekit:tool-nav:open:v1', JSON.stringify(normalizedOpenState));
	}, [normalizedOpenState]);

	useEffect(() => {
		window.localStorage.setItem('bytekit:tool-nav:collapsed:v1', String(collapsed));
	}, [collapsed]);

	function toggleCategory(categoryId: string) {
		setOpenState((current) => ({ ...current, [categoryId]: !normalizedOpenState[categoryId] }));
	}

	return (
		<aside suppressHydrationWarning className={collapsed ? 'tool-sidebar tool-sidebar--collapsed' : 'tool-sidebar'} aria-label="工具目录">
			<button
				className="tool-sidebar__head"
				type="button"
				onClick={() => setCollapsed((value) => !value)}
				aria-label={collapsed ? '展开工具目录' : '收起工具目录'}
				title={collapsed ? '展开工具目录' : '收起工具目录'}
			>
				<span className="tool-sidebar__title">工具目录</span>
				<ChevronLeft
					size={14}
					strokeWidth={2.5}
					style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }}
				/>
			</button>

			{collapsed ? null : (
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
			)}
		</aside>
	);
}
