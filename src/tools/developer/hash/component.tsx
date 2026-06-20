import { useCallback, useEffect, useMemo, useState } from 'react';
import CopyRow from '../../../components/shared/ui/CopyRow';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { computeHashes, type HashAlgorithm } from './functions';
import { hashReference } from './references';
import GeneratorPanel from '../../../components/shared/layouts/GeneratorPanel';
import { useAppMessage } from '../../../components/shared/ui/AppMessage';

const algorithms: HashAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

type HashViewState =
	| { status: 'idle'; hashes: Record<string, string> }
	| { status: 'loading'; hashes: Record<string, string> }
	| { status: 'ready'; hashes: Record<string, string> }
	| { status: 'error'; hashes: Record<string, string> };

export default function HashGenerator() {
	const message = useAppMessage();
	const [state, setState] = useToolStorage('bytekit:tool:hash:v1', { input: 'Bytekit' });
	const { input } = state;
	const setInput = useCallback((value: string) => setState((current) => ({ ...current, input: value })), [setState]);
	const [hashState, setHashState] = useState<HashViewState>({ status: 'idle', hashes: {} });

	useEffect(() => {
		if (!input) {
			setHashState({ status: 'idle', hashes: {} });
			return;
		}

		let cancelled = false;
		setHashState({ status: 'loading', hashes: {} });

		computeHashes(input).then((result) => {
			if (cancelled) return;
			if (result.ok) setHashState({ status: 'ready', hashes: result.hashes });
			else {
				message.error(result.error);
				setHashState((current) => current.hashes && Object.keys(current.hashes).length > 0 ? { status: 'ready', hashes: current.hashes } : { status: 'idle', hashes: {} });
			}
		}).catch(() => {
			if (!cancelled) {
				message.error('Hash 计算失败。');
				setHashState((current) => current.hashes && Object.keys(current.hashes).length > 0 ? { status: 'ready', hashes: current.hashes } : { status: 'idle', hashes: {} });
			}
		});

		return () => {
			cancelled = true;
		};
	}, [input, message]);

	const controls = useMemo(() => (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">输入内容</h2>
				<textarea
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="输入要计算哈希的内容"
					aria-label="输入内容"
					rows={4}
					className="tool-textarea"
				/>
			</div>
		</div>
	), [input, setInput]);

	const resultPanel = useMemo(() => (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">哈希结果</h2>
			{hashState.status === 'ready' ? (
				<div style={{ display: 'grid', gap: '6px' }}>
					{algorithms.map((algo) => (
						<CopyRow key={algo} label={algo} value={hashState.hashes[algo] ?? ''} />
					))}
				</div>
			) : hashState.status === 'loading' ? (
				<div style={{ display: 'grid', gap: '6px' }} aria-live="polite" aria-busy="true">
					{algorithms.map((algo) => (
						<div key={algo} className="copy-row">
							<span className="copy-row__label">{algo}</span>
							<code className="copy-row__value">计算中...</code>
						</div>
					))}
				</div>
			) : (
				<div style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>输入内容后自动计算。</div>
			)}
		</div>
	), [hashState]);

	useToolRefPanel('Hash 算法参考', hashReference);

	return (
		<GeneratorPanel ariaLabel="Hash 生成器" controls={controls} result={resultPanel} />
	);
}
