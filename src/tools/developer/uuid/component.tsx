import { useEffect, useState, useCallback, useMemo } from 'react';
import CopyRow from '../../../components/shared/ui/CopyRow';
import { generateUuidV4, generateBatch } from './functions';
import { uuidReference } from './references';
import GeneratorPanel from '../../../components/shared/layouts/GeneratorPanel';
import { useTheme } from '../../../themes/ThemeContext';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';
import { useTransientNotice } from '../../../hooks/useTransientNotice';

const MIN_COUNT = 1;
const MAX_COUNT = 50;

function normalizeInteger(value: string | number, fallback: number): number {
	const parsed = typeof value === 'number' ? value : Number(value);
	if (!Number.isFinite(parsed)) return fallback;
	return Math.min(MAX_COUNT, Math.max(MIN_COUNT, Math.trunc(parsed)));
}

export default function UuidGenerator() {
	const { Button } = useTheme();
	const [count, setCount] = useState(1);
	const [results, setResults] = useState<string[]>([]);
	const [copyNotice, showCopyNotice] = useTransientNotice();
	const isDirty = results.length > 0 && count !== results.length;

	const updateCount = useCallback((value: string | number) => {
		setCount((current) => normalizeInteger(value, current));
	}, []);

	const generate = useCallback(() => {
		setResults(generateBatch(count));
	}, [count]);

	useEffect(() => {
		setResults([generateUuidV4()]);
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
				<h2 className="tool-card__title">生成 UUID</h2>
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
						aria-label="UUID 数量"
					/>
				</div>
				<div className="copy-action-group" style={{ display: 'flex', gap: '8px' }}>
					<Button variant="primary" onClick={generate}>生成</Button>
					<Button variant="secondary" disabled={results.length === 0 || isDirty} onClick={copyAll}>复制全部</Button>
					{copyNotice ? <span className="copy-feedback code-editor__action-status" role="status" aria-live="polite">{copyNotice}</span> : null}
				</div>
			</div>
		</div>
	), [count, copyNotice, generate, copyAll, isDirty, results.length, updateCount]);

	const resultPanel = useMemo(() => (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">结果</h2>
			{isDirty ? <div className="code-editor__message code-editor__message--neutral">数量已变化，请重新生成。</div> : null}
			<div style={{ display: 'grid', gap: '4px' }}>
				{results.map((uuid, i) => (
					<CopyRow key={i} label={`#${i + 1}`} value={uuid} />
				))}
			</div>
		</div>
	), [isDirty, results]);

	useToolRefPanel('UUID 参考', uuidReference);

	return <GeneratorPanel ariaLabel="UUID 生成器" controls={controls} result={resultPanel} />;
}
