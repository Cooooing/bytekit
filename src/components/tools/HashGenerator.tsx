import { useEffect, useMemo, useState } from 'react';
import CodeEditor from '../editor/CodeEditor';
import { useToolStorage } from '../../hooks/useToolStorage';
import { computeHashes, type HashAlgorithm } from '../../lib/tools/hash';
import { IoWorkbench } from './ToolLayouts';

const text = {
	tool: 'Hash 生成器',
	input: '输入',
	output: '结果',
	waiting: '输入内容后自动计算',
};

const algorithms: HashAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

export default function HashGenerator() {
	const [state, setState] = useToolStorage('bytekit:tool:hash:v1', { input: 'Bytekit' });
	const { input } = state;
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));
	const [hashes, setHashes] = useState<Record<string, string>>({});

	useEffect(() => {
		if (!input) { setHashes({}); return; }
		computeHashes(input).then((result) => {
			if (result.ok) setHashes(result.hashes);
		});
	}, [input]);

	const output = input
		? algorithms.map((algo) => `${algo}:\n${hashes[algo] ?? '...'}`).join('\n\n')
		: '';

	return (
		<IoWorkbench
			ariaLabel={text.tool}
			actions={<span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>{text.waiting}</span>}
			input={<CodeEditor title={text.input} value={input} onChange={setInput} language="text" minHeight="compact" />}
			output={<CodeEditor title={text.output} value={output} language="text" minHeight="compact" />}
		/>
	);
}
