import { lazy, Suspense, type CSSProperties, type ComponentType } from 'react';

export type CodeEditorLanguage = 'text' | 'json' | 'javascript' | 'html' | 'css' | 'proto';
export type CodeEditorStatus = 'neutral' | 'success' | 'error';
export type CodeEditorMessageTone = 'neutral' | 'error';

export interface CodeEditorProps {
	title: string;
	value: string;
	onChange?: (value: string) => void;
	language?: CodeEditorLanguage;
	status?: CodeEditorStatus;
	statusText?: string;
	message?: string;
	messageTone?: CodeEditorMessageTone;
	error?: string;
	minHeight?: 'default' | 'compact' | string;
	className?: string;
	readOnly?: boolean;
}

type CodeEditorRuntime = ComponentType<CodeEditorProps>;
type CodeEditorRuntimeModule = Promise<{ default: CodeEditorRuntime }>;

let runtimeLoad: CodeEditorRuntimeModule | undefined;

function loadRuntime() {
	if (!runtimeLoad) runtimeLoad = import('./CodeEditorRuntime');
	return runtimeLoad;
}

const RuntimeEditor = lazy(loadRuntime);

export function preloadCodeEditor() {
	void loadRuntime();
}

function editorHeight(minHeight: CodeEditorProps['minHeight']) {
	if (!minHeight || minHeight === 'default') return 'var(--editor-height-default)';
	if (minHeight === 'compact') return 'var(--editor-height-compact)';
	return minHeight;
}

function EditorSkeleton({ title, value, minHeight = 'default', className }: CodeEditorProps) {
	const style = { '--code-editor-min-height': editorHeight(minHeight) } as CSSProperties;
	const lines = value === '' ? 0 : value.split('\n').length;

	return (
		<div className={['code-editor', 'code-editor--loading', className].filter(Boolean).join(' ')} style={style} aria-busy="true">
			<div className="code-editor__toolbar">
				<div className="code-editor__title-group">
					<span className="code-editor__title">{title}</span>
					<span className="code-editor__meta">{lines} 行 / {value.length} 字符</span>
				</div>
			</div>
			<div className="code-editor__skeleton" aria-label="编辑器加载中" />
		</div>
	);
}

export default function CodeEditor(props: CodeEditorProps) {
	return <Suspense fallback={<EditorSkeleton {...props} />}><RuntimeEditor {...props} /></Suspense>;
}
