import { useState } from 'react';
import Button from '../ui/Button';
import { generateUuidV4, generateBatch } from '../../lib/tools/uuid';
import { GeneratorPanel } from './ToolLayouts';

export default function UuidGenerator() {
	const [count, setCount] = useState(1);
	const [results, setResults] = useState<string[]>([generateUuidV4()]);
	const [notice, setNotice] = useState('');

	function generate() {
		setResults(generateBatch(count));
	}

	async function copyAll() {
		try {
			await navigator.clipboard.writeText(results.join('\n'));
			setNotice('已复制');
		} catch {
			setNotice('复制失败');
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
					<Button variant="secondary" onClick={copyAll}>复制全部</Button>
				</div>
				{notice ? <span className="password-notice">{notice}</span> : null}
			</div>
		</div>
	);

	const resultPanel = (
		<div className="password-card password-card--result">
			<h2 className="password-card__title">结果</h2>
			<div style={{ fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: 1.8, wordBreak: 'break-all' }}>
				{results.map((uuid, i) => (
					<div key={i}>{uuid}</div>
				))}
			</div>
		</div>
	);

	return <GeneratorPanel ariaLabel="UUID 生成器" controls={controls} result={resultPanel} />;
}
