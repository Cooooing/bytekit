import { Component, useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { getToolById, tools } from '../core/registry';
import { loadToolComponent } from '../core/components';
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
	const [activeToolId] = useState(initialToolId);
	const activeTool = useMemo(() => getToolById(activeToolId) ?? tools[0], [activeToolId]);
	const [ToolComponent, setToolComponent] = useState<ComponentType | null>(null);
	const [hasLoadError, setHasLoadError] = useState(false);
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
		let cancelled = false;
		setToolComponent(null);
		setHasLoadError(false);
		const module = loadToolComponent(activeTool.id);
		if (!module) {
			setHasLoadError(true);
			return;
		}
		module
			.then((loaded) => {
				if (!cancelled) setToolComponent(() => loaded.default);
			})
			.catch(() => {
				if (!cancelled) setHasLoadError(true);
			});
		return () => {
			cancelled = true;
		};
	}, [activeTool.id]);

	return (
		<div className="tool-app-shell">
			<ToolSidebar activeToolId={activeTool.id} />
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
							{hasLoadError ? (
								<div className="state-box state-box--error" role="alert">工具资源加载失败。</div>
							) : ToolComponent ? <ToolComponent /> : <div className="state-box" role="status" aria-live="polite">加载中...</div>}
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
