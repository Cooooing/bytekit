import { useMemo, useState } from 'react';
import Button from '../ui/Button';
import CopyRow from '../ui/CopyRow';
import { parseTimestamp } from '../../lib/tools/timestamp';
import { GeneratorPanel } from './ToolLayouts';

export default function TimestampConverter() {
	const [input, setInput] = useState(String(Math.floor(Date.now() / 1000)));
	const result = useMemo(() => parseTimestamp(input), [input]);

	function setToNow() {
		setInput(String(Math.floor(Date.now() / 1000)));
	}

	function setToNowMs() {
		setInput(String(Date.now()));
	}

	const controls = (
		<div className="password-card password-card--controls">
			<div className="password-card__section">
				<h2 className="password-card__title">输入时间戳或日期</h2>
				<input
					className="password-length-input"
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="如 1700000000 或 2024-01-01"
					aria-label="时间戳输入"
					style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-subtle)', color: 'var(--text)' }}
				/>
				<div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
					<Button variant="secondary" onClick={setToNow}>当前（秒）</Button>
					<Button variant="secondary" onClick={setToNowMs}>当前（毫秒）</Button>
				</div>
			</div>
		</div>
	);

	const resultPanel = (
		<div className="password-card password-card--result">
			<h2 className="password-card__title">转换结果</h2>
			{result.ok ? (
				<div style={{ display: 'grid', gap: '6px' }}>
					<CopyRow label="Unix" value={String(result.unix)} />
					<CopyRow label="ISO" value={result.iso} />
					<CopyRow label="本地" value={result.local} />
					<CopyRow label="UTC" value={result.utc} />
				</div>
			) : (
				<div style={{ color: 'var(--semantic-danger)' }}>{result.error}</div>
			)}
		</div>
	);

	return <GeneratorPanel ariaLabel="时间戳转换工具" controls={controls} result={resultPanel} />;
}
