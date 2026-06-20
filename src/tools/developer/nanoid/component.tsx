import { useState, useCallback, useMemo } from 'react';
import CopyRow from '../../../components/shared/ui/CopyRow';
import { generateBatch } from './functions';
import { nanoidReference } from './references';
import GeneratorPanel from '../../../components/shared/layouts/GeneratorPanel';
import { useTheme } from '../../../themes/ThemeContext';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';

export default function NanoidGenerator() {
	const { Button } = useTheme();
	const [length, setLength] = useState(21);
	const [count, setCount] = useState(5);
	const [alphabet, setAlphabet] = useState('');
	const [results, setResults] = useState<string[]>(() => generateBatch(5, 21));
	const [copied, setCopied] = useState(false);

	const generate = useCallback(() => {
		const chars = alphabet.trim() || undefined;
		setResults(generateBatch(count, length, chars));
	}, [count, length, alphabet]);

	const copyAll = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(results.join('\n'));
			setCopied(true);
			setTimeout(() => setCopied(false), 1400);
		} catch {
			// ignore
		}
	}, [results]);

	const controls = useMemo(() => (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">生成 NanoID</h2>
				<div className="password-length-row">
					<label className="password-length-row__label">长度</label>
					<input
						className="password-range"
						type="range"
						min={1}
						max={50}
						value={length}
						onChange={(e) => setLength(Number(e.target.value))}
					/>
					<input
						className="password-length-input"
						type="number"
						min={1}
						max={50}
						value={length}
						onChange={(e) => setLength(Number(e.target.value))}
						aria-label="NanoID 长度"
					/>
				</div>
				<div className="password-length-row">
					<label className="password-length-row__label">数量</label>
					<input
						className="password-range"
						type="range"
						min={1}
						max={50}
						value={count}
						onChange={(e) => setCount(Number(e.target.value))}
					/>
					<input
						className="password-length-input"
						type="number"
						min={1}
						max={100}
						value={count}
						onChange={(e) => setCount(Number(e.target.value))}
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
				<div style={{ display: 'flex', gap: '8px' }}>
					<Button variant="primary" onClick={generate}>生成</Button>
					<Button variant="secondary" onClick={copyAll}>{copied ? '已复制' : '复制全部'}</Button>
				</div>
			</div>
		</div>
	), [length, count, alphabet, copied, generate, copyAll]);

	const resultPanel = useMemo(() => (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">结果</h2>
			<div style={{ display: 'grid', gap: '4px' }}>
				{results.map((id, i) => (
					<CopyRow key={i} label={`#${i + 1}`} value={id} />
				))}
			</div>
		</div>
	), [results]);

	useToolRefPanel('NanoID 参考', nanoidReference);

	return <GeneratorPanel ariaLabel="NanoID 生成器" controls={controls} result={resultPanel} />;
}
