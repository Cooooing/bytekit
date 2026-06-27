import { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';
import CodeEditor from '@features/tools/shared/CodeEditor';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue';
import IoWorkbench from '@features/tools/shared/IoWorkbench';
import { markdownReference } from './references';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useMessageOnError } from '@shared/ui/AppMessage';

const text = {
	tool: 'Markdown 预览',
	input: 'Markdown',
	output: '预览',
};

export default function MarkdownPreview() {
	const [state, setState] = useToolStorage('bytekit:tool:markdown:v1', {
		input: '# Hello Bytekit\n\n这是一个 **Markdown** 预览工具。\n\n## 功能\n\n- 实时预览\n- 支持 *斜体*、**粗体**、~~删除线~~\n- 代码块\n\n```js\nconsole.log("Hello!");\n```\n\n> 引用文本\n',
	});
	const { input } = state;
	const setInput = (v: string) => setState((c) => ({ ...c, input: v }));
	const previewInput = useDebouncedValue(input, 250);

	const renderResult = useMemo(() => {
		try {
			return { ok: true as const, html: renderMarkdown(previewInput) };
		} catch {
			return { ok: false as const, error: 'Markdown 解析错误。' };
		}
	}, [previewInput]);
	const [lastHtml, setLastHtml] = useState(renderResult.ok ? renderResult.html : '');
	const html = renderResult.ok ? renderResult.html : lastHtml;

	useMessageOnError(renderResult.ok ? undefined : renderResult.error);

	useEffect(() => {
		if (renderResult.ok) setLastHtml(renderResult.html);
	}, [renderResult]);

	useToolRefPanel('Markdown 语法', markdownReference);

	return (
		<IoWorkbench
			ariaLabel={text.tool}
			actions={
				<span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
					左侧输入 Markdown，右侧实时渲染预览。
				</span>
			}
			input={<CodeEditor title={text.input} value={input} onChange={setInput} language="text" />}
			output={
				<div className="code-editor" style={{ '--code-editor-min-height': 'var(--editor-height-default)' } as React.CSSProperties}>
					<div className="code-editor__toolbar">
						<div className="code-editor__title-group">
							<span className="code-editor__title">{text.output}</span>
						</div>
					</div>
					<div className="code-editor__surface">
						<div
							className="markdown-preview scrollbar-hidden"
							style={{ flex: 1, padding: '10px 12px', overflow: 'auto' }}
							dangerouslySetInnerHTML={{ __html: html }}
						/>
					</div>
				</div>
			}
		/>
	);
}

function renderMarkdown(input: string): string {
	const html = marked.parse(escapeRawHtml(input)) as string;
	return sanitizeMarkdownHtml(html)
		.replace(/<table>/g, '<div class="markdown-table-scroll scrollbar-hidden"><table>')
		.replace(/<\/table>/g, '</table></div>');
}

function escapeRawHtml(input: string): string {
	return input
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function sanitizeMarkdownHtml(html: string): string {
	return html.replace(/\s(href|src)=("([^"]*)"|'([^']*)')/gi, (match, attr, quoted, doubleQuotedValue, singleQuotedValue) => {
		const value = doubleQuotedValue ?? singleQuotedValue ?? '';
		return isSafeUrl(value) ? ` ${attr}=${quoted}` : '';
	});
}

function isSafeUrl(value: string): boolean {
	const trimmed = value.trim().replace(/[\u0000-\u001f\u007f\s]+/g, '');
	if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) return true;
	if (trimmed.startsWith('//')) return false;
	return /^(https?:|mailto:|tel:)/i.test(trimmed);
}
