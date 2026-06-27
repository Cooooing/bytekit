import { Component, useCallback, useEffect, useMemo, useRef, useState, Suspense, type ReactNode } from 'react';
import { getToolById, getToolHref, getToolIdFromPathname, getToolsByCategory, tools } from '../core/registry';
import { preloadToolComponent, toolComponents } from '../core/components';
import { RefPanelProvider, type RefContent } from '../shared/RefPanelContext';
import ReferencePanel from '@features/tools/shared/ReferencePanel';
import ToolSidebar from './ToolSidebar';

interface AppShellProps {
	initialToolId: string;
}

interface ToolErrorBoundaryProps {
	children: ReactNode;
}

interface ToolErrorBoundaryState {
	hasError: boolean;
}

class ToolErrorBoundary extends Component<ToolErrorBoundaryProps, ToolErrorBoundaryState> {
	state: ToolErrorBoundaryState = { hasError: false };

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="state-box state-box--error" role="alert">
					<div className="state-box__content">
						<p className="state-box__title">工具加载失败</p>
						<p className="state-box__desc">当前工具资源加载失败。请检查本地开发服务状态后重新加载。</p>
						<button className="ui-button ui-button--secondary ui-button--sm" type="button" onClick={() => window.location.reload()}>
							重新加载
						</button>
					</div>
				</div>
			);
		}
		return this.props.children;
	}
}

export default function AppShell({ initialToolId }: AppShellProps) {
	const [activeToolId, setActiveToolId] = useState(initialToolId);
	const activeToolIdRef = useRef(activeToolId);
	const activeTool = useMemo(() => getToolById(activeToolId) ?? tools[0], [activeToolId]);
	const ToolComponent = toolComponents[activeTool.id];
	const [refContent, setRefContent] = useState<RefContent | null>(null);
	const refPanelValue = useMemo(() => ({ setRefContent }), [setRefContent]);
	const [refCollapsed, setRefCollapsed] = useState(false);

	useEffect(() => {
		try {
			setRefCollapsed(localStorage.getItem('bytekit:tool-ref:collapsed:v1') === 'true');
		} catch {}
	}, []);

	useEffect(() => {
		try {
			localStorage.setItem('bytekit:tool-ref:collapsed:v1', String(refCollapsed));
		} catch {}
	}, [refCollapsed]);

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

	const previewTool = useCallback((toolId: string) => {
		preloadToolComponent(toolId);
	}, []);

	useEffect(() => {
		const relatedTools = getToolsByCategory(activeTool.category)
			.filter((tool) => tool.id !== activeTool.id)
			.slice(0, 3);
		const preload = () => relatedTools.forEach((tool) => preloadToolComponent(tool.id));
		if ('requestIdleCallback' in window) {
			const id = window.requestIdleCallback(preload, { timeout: 1200 });
			return () => window.cancelIdleCallback(id);
		}
		const timer = window.setTimeout(preload, 600);
		return () => window.clearTimeout(timer);
	}, [activeTool.category, activeTool.id]);

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
			<ToolSidebar activeToolId={activeTool.id} onSelectTool={selectTool} onPreviewTool={previewTool} />
			<section className="tool-app-content">
				<header className="tool-app-head">
					<div>
						<h1 className="page-title">{activeTool.name}</h1>
						<p className="page-desc">{activeTool.description}</p>
					</div>
				</header>
				<RefPanelProvider value={refPanelValue}>
					<div className="tool-app-body">
						<ToolErrorBoundary key={activeTool.id}>
							<Suspense fallback={<div className="state-box">加载中...</div>}>
								{ToolComponent ? <ToolComponent /> : <div className="state-box">工具组件未注册。</div>}
							</Suspense>
						</ToolErrorBoundary>
					</div>
				</RefPanelProvider>
			</section>
			{refContent ? (
				<aside className={`tool-ref-sidebar${refCollapsed ? ' tool-ref-sidebar--collapsed' : ''}`}>
					<ReferencePanel
						title={refContent.title}
						sections={refContent.sections}
						collapsed={refCollapsed}
						onToggleCollapse={() => setRefCollapsed((value) => !value)}
					/>
				</aside>
			) : null}
		</div>
	);
}
