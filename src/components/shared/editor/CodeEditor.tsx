import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import type { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import Badge, { type BadgeTone } from '../ui/Badge';
import { useTheme } from '../../../themes/ThemeContext';

export type CodeEditorLanguage = 'text' | 'json' | 'javascript' | 'html' | 'css';
export type CodeEditorStatus = 'neutral' | 'success' | 'error';
export type CodeEditorMessageTone = 'neutral' | 'error';

interface CodeEditorProps {
	title: string;
	value: string;
	onChange: (value: string) => void;
	language?: CodeEditorLanguage;
	status?: CodeEditorStatus;
	statusText?: string;
	message?: string;
	messageTone?: CodeEditorMessageTone;
	error?: string;
	minHeight?: 'default' | 'compact' | string;
	className?: string;
}

const label = {
	copy: '复制',
	clear: '清空',
	copied: '已复制',
	cleared: '已清空',
	copyFailed: '复制失败',
	lines: '行',
	chars: '字符',
};

const languageLoaders: Record<CodeEditorLanguage, () => Promise<Extension[]>> = {
	text: () => Promise.resolve([]),
	json: () => import('@codemirror/lang-json').then((m) => [m.json()]),
	javascript: () => import('@codemirror/lang-javascript').then((m) => [m.javascript()]),
	html: () => import('@codemirror/lang-html').then((m) => [m.html()]),
	css: () => import('@codemirror/lang-css').then((m) => [m.css()]),
};

const basicSetup = {
	lineNumbers: true,
	foldGutter: true,
	highlightActiveLine: true,
	bracketMatching: true,
};

function meta(value: string) {
	const lines = value === '' ? 0 : value.split('\n').length;
	return String(lines) + ' ' + label.lines + ' / ' + String(value.length) + ' ' + label.chars;
}

function statusTone(status: CodeEditorStatus): BadgeTone {
	if (status === 'success') return 'success';
	if (status === 'error') return 'danger';
	return 'neutral';
}

function editorHeight(minHeight: CodeEditorProps['minHeight']) {
	if (!minHeight || minHeight === 'default') return 'var(--editor-height-default)';
	if (minHeight === 'compact') return 'var(--editor-height-compact)';
	return minHeight;
}

export default function CodeEditor({
	title,
	value,
	onChange,
	language = 'text',
	status = 'neutral',
	statusText,
	message,
	messageTone = 'neutral',
	error,
	minHeight = 'default',
	className,
}: CodeEditorProps) {
	const [notice, setNotice] = useState('');
	const { Button } = useTheme();
	const [extensions, setExtensions] = useState<Extension[]>([]);

	useEffect(() => {
		let cancelled = false;
		languageLoaders[language]().then((exts) => {
			if (!cancelled) setExtensions(exts);
		});
		return () => { cancelled = true; };
	}, [language]);

	const allExtensions = useMemo(() => [EditorView.lineWrapping, ...extensions], [extensions]);
	const isEmpty = value.length === 0;
	const editorMessage = error ?? message;
	const editorMessageTone = error ? 'error' : messageTone;
	const editorMessageClassName = 'code-editor__message code-editor__message--' + editorMessageTone;
	const editorStyle = { '--code-editor-min-height': editorHeight(minHeight) } as CSSProperties;

	useEffect(() => {
		if (!notice) return;
		const timer = window.setTimeout(() => setNotice(''), 1400);
		return () => window.clearTimeout(timer);
	}, [notice]);

	async function copyValue() {
		if (isEmpty) return;
		try {
			await navigator.clipboard.writeText(value);
			setNotice(label.copied);
		} catch {
			setNotice(label.copyFailed);
		}
	}

	function clearValue() {
		onChange('');
		setNotice(label.cleared);
	}

	return (
		<div className={['code-editor', className].filter(Boolean).join(' ')} style={editorStyle}>
			<div className="code-editor__toolbar">
				<div className="code-editor__title-group">
					<span className="code-editor__title">{title}</span>
					<span className="code-editor__meta">{meta(value)}</span>
				</div>
				<div className="code-editor__actions">
					{statusText ? <Badge tone={statusTone(status)}>{statusText}</Badge> : null}
					{notice ? <span className="code-editor__action-status">{notice}</span> : null}
					<Button variant="secondary" size="sm" disabled={isEmpty} onClick={copyValue}>{label.copy}</Button>
					<Button variant="ghost" size="sm" disabled={isEmpty} onClick={clearValue}>{label.clear}</Button>
				</div>
			</div>
			{editorMessage ? <div className={editorMessageClassName}>{editorMessage}</div> : null}
			<CodeMirror
				className="code-editor__surface"
				value={value}
				basicSetup={basicSetup}
				extensions={allExtensions}
				onChange={onChange}
			/>
		</div>
	);
}
