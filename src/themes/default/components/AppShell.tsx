import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import type { AppShellProps } from '../../types';
import { getToolById, getToolHref, getToolIdFromPathname, tools } from '../../../tools/registry';
import { useTheme } from '../../ThemeContext';
import { toolComponents } from '../../../tools/components';

export default function AppShell({ initialToolId }: AppShellProps) {
	const [activeToolId, setActiveToolId] = useState(initialToolId);
	const activeToolIdRef = useRef(activeToolId);
	const activeTool = useMemo(() => getToolById(activeToolId) ?? tools[0], [activeToolId]);
	const ToolComponent = toolComponents[activeTool.id];
	const { ToolSidebar } = useTheme();

	useEffect(() => {
		activeToolIdRef.current = activeToolId;
	}, [activeToolId]);

	const selectTool = useCallback((toolId: string) => {
		const nextTool = getToolById(toolId);
		if (!nextTool || toolId === activeToolIdRef.current) return;
		setActiveToolId(toolId);
		window.history.pushState({ toolId }, '', getToolHref(nextTool));
		document.title = `${nextTool.name} - Bytekit`;
	}, []);

	useEffect(() => {
		function handlePopState() {
			const nextToolId = getToolIdFromPathname(window.location.pathname);
			if (getToolById(nextToolId)) setActiveToolId(nextToolId);
		}
		function handleSelectTool(event: Event) {
			const customEvent = event as CustomEvent<{ toolId: string }>;
			selectTool(customEvent.detail.toolId);
		}
		window.addEventListener('popstate', handlePopState);
		window.addEventListener('bytekit:select-tool', handleSelectTool);
		return () => {
			window.removeEventListener('popstate', handlePopState);
			window.removeEventListener('bytekit:select-tool', handleSelectTool);
		};
	}, [selectTool]);

	return (
		<div className="tool-app-shell">
			<ToolSidebar activeToolId={activeTool.id} onSelectTool={selectTool} />
			<section className="tool-app-content">
				<header className="tool-app-head">
					<div>
						<h1 className="page-title">{activeTool.name}</h1>
						<p className="page-desc">{activeTool.description}</p>
					</div>
				</header>
				<Suspense fallback={<div className="state-box">加载中...</div>}>
					{ToolComponent ? <ToolComponent /> : <div className="state-box">工具组件未注册。</div>}
				</Suspense>
			</section>
		</div>
	);
}
