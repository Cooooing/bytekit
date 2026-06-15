import { useMemo, useState } from 'react';
import CodeEditor from '../editor/CodeEditor';
import Badge from '../ui/Badge';
import { useToolStorage } from '../../hooks/useToolStorage';
import { testRegex } from '../../lib/tools/regex';
import { IoWorkbench } from './ToolLayouts';

const text = {
	tool: '正则表达式测试',
	input: '输入文本',
	output: '匹配结果',
};

export default function RegexTester() {
	const [state, setState] = useToolStorage('bytekit:tool:regex:v1', {
		input: 'Hello World 123\nfoo@bar.com\n2024-01-15',
		pattern: '\\d+',
		flags: 'g',
	});
	const { input, pattern, flags } = state;
	const setInput = (v: string) => setState((c) => ({ ...c, input: v }));
	const setPattern = (v: string) => setState((c) => ({ ...c, pattern: v }));
	const setFlags = (v: string) => setState((c) => ({ ...c, flags: v }));

	const result = useMemo(() => testRegex(pattern, flags, input), [pattern, flags, input]);

	const output = result.ok
		? result.matches.length > 0
			? result.matches.map((m, i) =>
				`匹配 ${i + 1}: "${m.fullMatch}" (位置 ${m.index})${m.groups.length > 0 ? '\n  分组: ' + m.groups.map((g, j) => `$${j + 1}="${g}"`).join(', ') : ''}`
			).join('\n\n')
			: '无匹配结果。'
		: result.error;

	return (
		<IoWorkbench
			ariaLabel={text.tool}
			actions={(
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
					<span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>/</span>
					<input
						type="text"
						value={pattern}
						onChange={(e) => setPattern(e.target.value)}
						placeholder="正则表达式"
						aria-label="正则表达式"
						style={{ flex: 1, minWidth: '8rem', padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-subtle)', color: 'var(--text)', fontFamily: 'monospace', fontSize: '0.875rem' }}
					/>
					<span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>/</span>
					<input
						type="text"
						value={flags}
						onChange={(e) => setFlags(e.target.value)}
						placeholder="flags"
						aria-label="正则标志"
						style={{ width: '3rem', padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-subtle)', color: 'var(--text)', fontFamily: 'monospace', fontSize: '0.875rem' }}
					/>
					{result.ok ? <Badge tone="success">{result.count} 个匹配</Badge> : <Badge tone="danger">错误</Badge>}
				</div>
			)}
			input={<CodeEditor title={text.input} value={input} onChange={setInput} language="text" />}
			output={<CodeEditor title={text.output} value={output} language="text" status={result.ok ? 'success' : 'error'} />}
		/>
	);
}
