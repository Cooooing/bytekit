import { useEffect, useState, useCallback, useMemo } from 'react';
import CopyRow from '../../../components/shared/ui/CopyRow';
import { generateBatch } from './functions';
import { nanoidReference } from './references';
import GeneratorPanel from '../../../components/shared/layouts/GeneratorPanel';
import { useTheme } from '../../../themes/ThemeContext';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';
import { useTransientNotice } from '../../../hooks/useTransientNotice';

const MIN_LENGTH = 1;
const MAX_LENGTH = 50;
const MIN_COUNT = 1;
const MAX_COUNT = 50;

function normalizeInteger(value: string | number, min: number, max: number, fallback: number): number {
	const parsed = typeof value === 'number' ? value : Number(value);
	if (!Number.isFinite(parsed)) return fallback;
	return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

export default function NanoidGenerator() {
	const { Button } = useTheme();
	const [length, setLength] = useState(21);
	const [count, setCount] = useState(5);
	const [alphabet, setAlphabet] = useState('');
	const [results, setResults] = useState<string[]>([]);
	const [generatedConfig, setGeneratedConfig] = useState({ length: 21, count: 5, alphabet: '' });
	const [copyNotice, showCopyNotice] = useTransientNotice();
	const normalizedAlphabet = alphabet.trim();
	const isDirty = results.length > 0 && (
		generatedConfig.length !== length ||
		generatedConfig.count !== count ||
		generatedConfig.alphabet !== normalizedAlphabet
	);

	const updateLength = useCallback((value: string | number) => {
		setLength((current) => normalizeInteger(value, MIN_LENGTH, MAX_LENGTH, current));
	}, []);

	const updateCount = useCallback((value: string | number) => {
		setCount((current) => normalizeInteger(value, MIN_COUNT, MAX_COUNT, current));
	}, []);

	const generate = useCallback(() => {
		const chars = normalizedAlphabet || undefined;
		setResults(generateBatch(count, length, chars));
		setGeneratedConfig({ length, count, alphabet: normalizedAlphabet });
	}, [count, length, normalizedAlphabet]);

	useEffect(() => {
		setResults(generateBatch(5, 21));
	}, []);

	const copyAll = useCallback(async () => {
		if (results.length === 0 || isDirty) return;
		try {
			await navigator.clipboard.writeText(results.join('\n'));
			showCopyNotice(`已复制 ${results.length} 个`);
		} catch {
			showCopyNotice('复制失败');
		}
	}, [isDirty, results, showCopyNotice]);

	const controls = useMemo(() => (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">生成 NanoID</h2>
				<div className="password-length-row">
					<label className="password-length-row__label">长度</label>
					<input
						className="password-range"
						type="range"
						min={MIN_LENGTH}
						max={MAX_LENGTH}
						value={length}
						onChange={(e) => updateLength(e.target.value)}
					/>
					<input
						className="password-length-input"
						type="number"
						min={MIN_LENGTH}
						max={MAX_LENGTH}
						value={length}
						onChange={(e) => updateLength(e.target.value)}
						aria-label="NanoID 长度"
					/>
				</div>
				<div className="password-length-row">
					<label className="password-length-row__label">数量</label>
					<input
						className="password-range"
						type="range"
						min={MIN_COUNT}
						max={MAX_COUNT}
						value={count}
						onChange={(e) => updateCount(e.target.value)}
					/>
					<input
						className="password-length-input"
						type="number"
						min={MIN_COUNT}
						max={MAX_COUNT}
						value={count}
						onChange={(e) => updateCount(e.target.value)}
						aria-label="NanoID 数量"
					/>
				</div>
				<div>
					<label className="password-length-row__label">自定义字符集（可选）</label>
					<input
						className="password-length-input"
						type="text"
						value={alphabet}
						onChange={(e) => setAlphabet(e.target.value)}
						placeholder="默认: A-Z a-z 0-9"
						aria-label="自定义字符集"
						style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-subtle)', color: 'var(--text)' }}
					/>
				</div>
				<div className="copy-action-group" style={{ display: 'flex', gap: '8px' }}>
					<Button variant="primary" onClick={generate}>生成</Button>
					<Button variant="secondary" disabled={results.length === 0 || isDirty} onClick={copyAll}>复制全部</Button>
					{copyNotice ? <span className="copy-feedback code-editor__action-status" role="status" aria-live="polite">{copyNotice}</span> : null}
				</div>
			</div>
		</div>
	), [length, count, alphabet, copyNotice, generate, copyAll, isDirty, results.length, updateLength, updateCount]);

	const resultPanel = useMemo(() => (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">结果</h2>
			{isDirty ? <div className="code-editor__message code-editor__message--neutral">参数已变化，请重新生成。</div> : null}
			<div style={{ display: 'grid', gap: '4px' }}>
				{results.map((id, i) => (
					<CopyRow key={i} label={`#${i + 1}`} value={id} />
				))}
			</div>
		</div>
	), [isDirty, results]);

	useToolRefPanel('NanoID 参考', nanoidReference);

	return <GeneratorPanel ariaLabel="NanoID 生成器" controls={controls} result={resultPanel} />;
}
