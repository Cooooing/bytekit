import { useMemo } from 'react';
import CodeEditor from '../../../components/shared/editor/CodeEditor';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { computeStats, type TextStats } from './functions';
import { wordCountReference } from './references';
import IoWorkbench from '../../../components/shared/layouts/IoWorkbench';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';

const statLabels: Array<{ key: keyof TextStats; label: string }> = [
	{ key: 'characters', label: '总字符数' },
	{ key: 'charactersNoSpaces', label: '不含空格' },
	{ key: 'words', label: '单词数' },
	{ key: 'lines', label: '行数' },
	{ key: 'paragraphs', label: '段落数' },
	{ key: 'chinese', label: '中文字数' },
	{ key: 'sentences', label: '句子数' },
	{ key: 'bytes', label: '字节数' },
];

export default function WordCount() {
	const [state, setState] = useToolStorage('bytekit:tool:word-count:v1', {
		input: 'Hello, World!\n\n你好世界，这是一个文本统计工具。\n支持中英文混合内容。',
	});
	const { input } = state;
	const setInput = (v: string) => setState((c) => ({ ...c, input: v }));

	const stats = useMemo(() => computeStats(input), [input]);

	const output = (
		<div className="tool-card tool-card--result" style={{ height: '100%', overflow: 'auto' }}>
			<h2 className="tool-card__title">统计结果</h2>
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
				{statLabels.map(({ key, label }) => (
					<div
						key={key}
						style={{
							display: 'flex',
							flexDirection: 'column',
							padding: '12px',
							borderRadius: '8px',
							background: 'var(--surface)',
							gap: '4px',
						}}
					>
						<span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{label}</span>
						<span style={{ fontSize: '1.25rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
							{stats[key].toLocaleString()}
						</span>
					</div>
				))}
			</div>
		</div>
	);

	useToolRefPanel('文本统计参考', wordCountReference);

	return (
		<IoWorkbench
			ariaLabel="文本统计工具"
			actions={null}
			input={
				<CodeEditor
					title="输入文本"
					value={input}
					onChange={setInput}
					language="text"
				/>
			}
			output={output}
		/>
	);
}
