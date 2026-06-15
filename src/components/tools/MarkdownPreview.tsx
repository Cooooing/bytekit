import { useMemo } from 'react';
import { marked } from 'marked';
import CodeEditor from '../editor/CodeEditor';
import { useToolStorage } from '../../hooks/useToolStorage';
import { IoWorkbench } from './ToolLayouts';

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

	const html = useMemo(() => {
		try {
			return marked.parse(input) as string;
		} catch {
			return '<p style="color:red">Markdown 解析错误</p>';
		}
	}, [input]);

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
						<span className="code-editor__title">{text.output}</span>
					</div>
					<div
						className="markdown-preview"
						style={{ padding: '16px', overflow: 'auto', minHeight: 'var(--editor-height-default)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0 0 var(--radius-md) var(--radius-md)' }}
						dangerouslySetInnerHTML={{ __html: html }}
					/>
				</div>
			}
		/>
	);
}
