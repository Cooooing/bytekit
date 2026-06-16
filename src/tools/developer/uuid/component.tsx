import { useState } from 'react';
import CopyRow from '../../../components/shared/ui/CopyRow';
import { generateUuidV4, generateBatch } from './functions';
import GeneratorPanel from '../../../components/shared/layouts/GeneratorPanel';
import { useTheme } from '../../../themes/ThemeContext';

export default function UuidGenerator() {
	const { Button } = useTheme();
	const [count, setCount] = useState(1);
	const [results, setResults] = useState<string[]>([generateUuidV4()]);
	const [copied, setCopied] = useState(false);

	function generate() {
		setResults(generateBatch(count));
	}

	async function copyAll() {
		try {
			await navigator.clipboard.writeText(results.join('\n'));
			setCopied(true);
			setTimeout(() => setCopied(false), 1400);
		} catch {
			// ignore
		}
	}

	const controls = (
		<div className="password-card password-card--controls">
			<div className="password-card__section">
				<h2 className="password-card__title">生成 UUID</h2>
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
						aria-label="UUID 数量"
					/>
				</div>
				<div style={{ display: 'flex', gap: '8px' }}>
					<Button variant="primary" onClick={generate}>生成</Button>
					<Button variant="secondary" onClick={copyAll}>{copied ? '已复制' : '复制'}</Button>
				</div>
			</div>
		</div>
	);

	const resultPanel = (
		<div className="password-card password-card--result">
			<h2 className="password-card__title">结果</h2>
			<div style={{ display: 'grid', gap: '4px' }}>
				{results.map((uuid, i) => (
					<CopyRow key={i} label={`#${i + 1}`} value={uuid} />
				))}
			</div>
		</div>
	);

	return <GeneratorPanel ariaLabel="UUID 生成器" controls={controls} result={resultPanel} />;
}
