import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { Prec, type Extension } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { redo, undo } from '@codemirror/commands';
import { HighlightStyle, StreamLanguage, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import Badge, { type BadgeTone } from './Badge';
import type { CodeEditorLanguage, CodeEditorProps, CodeEditorStatus } from './CodeEditor';
import { useTheme } from '@themes/ThemeContext';
import { useClipboardCopy } from '@shared/hooks/useClipboardCopy';

const label = { copy: '复制', clear: '清空', copied: '已复制', cleared: '已清空', copyFailed: '复制失败', lines: '行', chars: '字符' };

const protoLanguageExtension = StreamLanguage.define({
	token(stream) {
		if (stream.match('//')) { stream.skipToEnd(); return 'comment'; }
		if (stream.match(/\/\*.*?\*\//)) return 'comment';
		if (stream.match(/"(?:[^"\\]|\\.)*"?/)) return 'string';
		if (stream.match(/\b\d+\b/)) return 'number';
		if (stream.match(/\b(?:syntax|package|import|option|message|enum|oneof|map|repeated|optional|required|reserved|service|rpc|returns|extend|extensions|public)\b/)) return 'keyword';
		if (stream.match(/\b(?:double|float|int32|int64|uint32|uint64|sint32|sint64|fixed32|fixed64|sfixed32|sfixed64|bool|string|bytes)\b/)) return 'typeName';
		if (stream.match(/[{}[\]();,=<>]/)) return 'punctuation';
		if (stream.match(/[A-Z][A-Za-z0-9_]*/)) return 'typeName';
		if (stream.match(/[a-z_][A-Za-z0-9_]*/)) return 'propertyName';
		stream.next();
		return null;
	},
});

const languageLoaders: Record<CodeEditorLanguage, () => Promise<Extension[]>> = {
	text: () => Promise.resolve([]), json: () => import('@codemirror/lang-json').then((m) => [m.json()]),
	javascript: () => import('@codemirror/lang-javascript').then((m) => [m.javascript()]),
	html: () => import('@codemirror/lang-html').then((m) => [m.html()]), css: () => import('@codemirror/lang-css').then((m) => [m.css()]),
	proto: () => Promise.resolve([protoLanguageExtension]),
};
const languageExtensionCache = new Map<CodeEditorLanguage, Promise<Extension[]>>();
function loadLanguageExtensions(language: CodeEditorLanguage) {
	const cached = languageExtensionCache.get(language);
	if (cached) return cached;
	const promise = languageLoaders[language]();
	languageExtensionCache.set(language, promise);
	return promise;
}

const basicSetup = { lineNumbers: true, foldGutter: true, highlightActiveLine: true, bracketMatching: true };
const editingShortcutKeymap = Prec.highest(keymap.of([
	{ key: 'Mod-z', run: undo, preventDefault: true }, { key: 'Mod-y', mac: 'Mod-Shift-z', run: redo, preventDefault: true }, { win: 'Ctrl-Shift-z', linux: 'Ctrl-Shift-z', run: redo, preventDefault: true },
]));
const themeHighlightStyle = HighlightStyle.define([
	{ tag: tags.string, color: 'var(--code-token-string, #116329)' }, { tag: tags.number, color: 'var(--code-token-number, #175cd3)' }, { tag: tags.bool, color: 'var(--code-token-bool, #7a3db8)' }, { tag: tags.null, color: 'var(--code-token-null, #7a3db8)' },
	{ tag: tags.keyword, color: 'var(--code-token-keyword, #7a3db8)', fontWeight: '600' }, { tag: tags.typeName, color: 'var(--code-token-type, #8f4e00)', fontWeight: '600' }, { tag: tags.variableName, color: 'var(--code-token-property, #0f54b8)' }, { tag: tags.propertyName, color: 'var(--code-token-property, #0f54b8)' },
	{ tag: tags.comment, color: 'var(--code-token-comment, #647089)', fontStyle: 'italic' }, { tag: tags.punctuation, color: 'var(--code-token-punctuation, var(--text-secondary))' },
]);

function meta(value: string) { return `${value === '' ? 0 : value.split('\n').length} ${label.lines} / ${value.length} ${label.chars}`; }
function statusTone(status: CodeEditorStatus): BadgeTone { return status === 'success' ? 'success' : status === 'error' ? 'danger' : 'neutral'; }
function editorHeight(minHeight: CodeEditorProps['minHeight']) { return !minHeight || minHeight === 'default' ? 'var(--editor-height-default)' : minHeight === 'compact' ? 'var(--editor-height-compact)' : minHeight; }

export default function CodeEditorRuntime({ title, value, onChange, language = 'text', status = 'neutral', statusText, message, messageTone = 'neutral', error, minHeight = 'default', className, readOnly }: CodeEditorProps) {
	const { notice, copyText, showNotice } = useClipboardCopy({ successText: label.copied, errorText: label.copyFailed });
	const { Button } = useTheme();
	const [extensions, setExtensions] = useState<Extension[]>([]);
	useEffect(() => { let cancelled = false; loadLanguageExtensions(language).then((exts) => { if (!cancelled) setExtensions(exts); }); return () => { cancelled = true; }; }, [language]);
	const allExtensions = useMemo(() => [editingShortcutKeymap, EditorView.lineWrapping, syntaxHighlighting(themeHighlightStyle, { fallback: true }), ...extensions], [extensions]);
	const isReadOnly = readOnly ?? !onChange;
	const isEmpty = value.length === 0;
	const editorMessage = error ?? message;
	const editorStyle = { '--code-editor-min-height': editorHeight(minHeight) } as CSSProperties;
	return <div className={['code-editor', className].filter(Boolean).join(' ')} style={editorStyle}>
		<div className="code-editor__toolbar"><div className="code-editor__title-group"><span className="code-editor__title">{title}</span><span className="code-editor__meta">{meta(value)}</span></div><div className="code-editor__actions">{statusText ? <Badge tone={statusTone(status)}>{statusText}</Badge> : null}{notice ? <span className="copy-feedback code-editor__action-status" role="status" aria-live="polite">{notice}</span> : null}<Button variant="secondary" size="sm" disabled={isEmpty} onClick={() => void copyText(value)}>{label.copy}</Button>{!isReadOnly ? <Button variant="ghost" size="sm" disabled={isEmpty} onClick={() => { onChange?.(''); showNotice(label.cleared); }}>{label.clear}</Button> : null}</div></div>
		{editorMessage ? <div className={`code-editor__message code-editor__message--${error ? 'error' : messageTone}`}>{editorMessage}</div> : null}
		<CodeMirror className="code-editor__surface" value={value} basicSetup={basicSetup} extensions={allExtensions} onChange={isReadOnly ? undefined : onChange} readOnly={isReadOnly} />
	</div>;
}
