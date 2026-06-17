import { useEffect, useState } from 'react';
import CopyRow from '../../../components/shared/ui/CopyRow';
import { useRefPanel } from '../../../components/shared/layouts/RefPanelContext';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { computeHashes, type HashAlgorithm } from './functions';
import { hashReference } from './references';
import GeneratorPanel from '../../../components/shared/layouts/GeneratorPanel';

const algorithms: HashAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

export default function HashGenerator() {
	const { setRefContent } = useRefPanel();
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

	const controls = (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">输入内容</h2>
				<textarea
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="输入要计算哈希的内容"
					aria-label="输入内容"
					rows={4}
					style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-subtle)', color: 'var(--text)', fontFamily: 'monospace', fontSize: '0.875rem', resize: 'vertical' }}
				/>
			</div>
		</div>
	);

	const resultPanel = (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">哈希结果</h2>
			{input ? (
				<div style={{ display: 'grid', gap: '6px' }}>
					{algorithms.map((algo) => (
						<CopyRow key={algo} label={algo} value={hashes[algo] ?? '...'} />
					))}
				</div>
			) : (
				<div style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>输入内容后自动计算。</div>
			)}
		</div>
	);

	useEffect(() => {
		setRefContent({ title: 'Hash 算法参考', sections: hashReference });
		return () => setRefContent(null);
	}, [setRefContent]);

	return (
		<GeneratorPanel ariaLabel="Hash 生成器" controls={controls} result={resultPanel} />
		/>
	);
}
