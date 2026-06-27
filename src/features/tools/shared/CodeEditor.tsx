import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import type { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import Badge, { type BadgeTone } from './Badge';
import { useTheme } from '@themes/ThemeContext';
import { useClipboardCopy } from '@shared/hooks/useClipboardCopy';

export type CodeEditorLanguage = 'text' | 'json' | 'javascript' | 'html' | 'css';
export type CodeEditorStatus = 'neutral' | 'success' | 'error';
export type CodeEditorMessageTone = 'neutral' | 'error';

interface CodeEditorProps {
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

const languageExtensionCache = new Map<CodeEditorLanguage, Promise<Extension[]>>();

function loadLanguageExtensions(language: CodeEditorLanguage) {
	const cached = languageExtensionCache.get(language);
	if (cached) return cached;
	const promise = languageLoaders[language]();
	languageExtensionCache.set(language, promise);
	return promise;
}

const basicSetup = {
	lineNumbers: true,
	foldGutter: true,
	highlightActiveLine: true,
	bracketMatching: true,
};

const themeHighlightStyle = HighlightStyle.define([
	{ tag: tags.string, color: 'var(--code-token-string, #116329)' },
	{ tag: tags.number, color: 'var(--code-token-number, #175cd3)' },
	{ tag: tags.bool, color: 'var(--code-token-bool, #7a3db8)' },
	{ tag: tags.null, color: 'var(--code-token-null, #7a3db8)' },
	{ tag: tags.keyword, color: 'var(--code-token-keyword, #7a3db8)', fontWeight: '600' },
	{ tag: tags.propertyName, color: 'var(--code-token-property, #0f54b8)' },
	{ tag: tags.comment, color: 'var(--code-token-comment, #647089)', fontStyle: 'italic' },
	{ tag: tags.punctuation, color: 'var(--code-token-punctuation, var(--text-secondary))' },
]);

function meta(value: string) {
	let lines = value === '' ? 0 : 1;
	for (let index = 0; index < value.length; index++) {
		if (value.charCodeAt(index) === 10) lines += 1;
	}
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
	readOnly,
}: CodeEditorProps) {
	const { notice, copyText, showNotice } = useClipboardCopy({ successText: label.copied, errorText: label.copyFailed });
	const { Button } = useTheme();
	const [extensions, setExtensions] = useState<Extension[]>([]);

	useEffect(() => {
		let cancelled = false;
		loadLanguageExtensions(language).then((exts) => {
			if (!cancelled) setExtensions(exts);
		});
		return () => { cancelled = true; };
	}, [language]);

	const allExtensions = useMemo(() => [EditorView.lineWrapping, syntaxHighlighting(themeHighlightStyle, { fallback: true }), ...extensions], [extensions]);
	const isReadOnly = readOnly ?? !onChange;
	const isEmpty = value.length === 0;
	const editorMessage = error ?? message;
	const editorMessageTone = error ? 'error' : messageTone;
	const editorMessageClassName = 'code-editor__message code-editor__message--' + editorMessageTone;
	const editorStyle = { '--code-editor-min-height': editorHeight(minHeight) } as CSSProperties;
	const metaText = useMemo(() => meta(value), [value]);

	async function copyValue() {
		await copyText(value);
	}

	function clearValue() {
		if (!onChange || isReadOnly) return;
		onChange('');
		showNotice(label.cleared);
	}

	return (
		<div className={['code-editor', className].filter(Boolean).join(' ')} style={editorStyle}>
			<div className="code-editor__toolbar">
				<div className="code-editor__title-group">
					<span className="code-editor__title">{title}</span>
					<span className="code-editor__meta">{metaText}</span>
				</div>
				<div className="code-editor__actions">
					{statusText ? <Badge tone={statusTone(status)}>{statusText}</Badge> : null}
					{notice ? <span className="copy-feedback code-editor__action-status" role="status" aria-live="polite">{notice}</span> : null}
					<Button variant="secondary" size="sm" disabled={isEmpty} onClick={copyValue}>{label.copy}</Button>
					{!isReadOnly ? <Button variant="ghost" size="sm" disabled={isEmpty} onClick={clearValue}>{label.clear}</Button> : null}
				</div>
			</div>
			{editorMessage ? <div className={editorMessageClassName}>{editorMessage}</div> : null}
			<CodeMirror
				className="code-editor__surface"
				value={value}
				basicSetup={basicSetup}
				extensions={allExtensions}
				onChange={isReadOnly ? undefined : onChange}
				readOnly={isReadOnly}
			/>
		</div>
	);
}
