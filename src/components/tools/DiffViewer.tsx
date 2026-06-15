import { useMemo } from 'react';
import CodeEditor from '../editor/CodeEditor';
import { useToolStorage } from '../../hooks/useToolStorage';
import { diffLines } from '../../lib/tools/diff';
import { IoWorkbench } from './ToolLayouts';

const text = {
	tool: '文本差异对比',
	a: '原始文本',
	b: '修改文本',
	result: '对比结果',
};

export default function DiffViewer() {
	const [state, setState] = useToolStorage('bytekit:tool:diff:v1', {
		textA: 'Hello World\nfoo bar\nbaz qux',
		textB: 'Hello World\nfoo BAR\nbaz qux\nnew line',
	});
	const { textA, textB } = state;
	const setTextA = (v: string) => setState((c) => ({ ...c, textA: v }));
	const setTextB = (v: string) => setState((c) => ({ ...c, textB: v }));

	const diff = useMemo(() => diffLines(textA, textB), [textA, textB]);

	const output = diff.map((line) => {
		const prefix = line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  ';
		return prefix + line.content;
	}).join('\n');

	return (
		<IoWorkbench
			ariaLabel={text.tool}
			actions={
				<span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
					左侧为原始文本，右侧为修改文本，自动对比差异。
				</span>
			}
			input={<CodeEditor title={text.a} value={textA} onChange={setTextA} language="text" />}
			output={<CodeEditor title={text.b} value={output} language="text" />}
		/>
	);
}
