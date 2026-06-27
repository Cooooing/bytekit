import { useEffect, useMemo, useState } from 'react';
import CopyRow from '@features/tools/shared/CopyRow';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { parseTimestamp } from './functions';
import { timestampReference } from './references';
import GeneratorPanel from '@features/tools/shared/GeneratorPanel';
import { useTheme } from '@themes/ThemeContext';
import { useMessageOnError } from '@shared/ui/AppMessage';

const INPUT_KIND_LABELS = {
	seconds: '秒时间戳',
	milliseconds: '毫秒时间戳',
	date: '日期字符串',
} as const;

export default function TimestampConverter() {
	const { Button } = useTheme();
	const [input, setInput] = useState('1700000000');
	const result = useMemo(() => parseTimestamp(input), [input]);
	const displayResult = result.ok ? result : null;

	useMessageOnError(result.ok ? undefined : result.error);

	useEffect(() => {
		setInput(String(Math.floor(Date.now() / 1000)));
	}, []);

	function setToNow() {
		setInput(String(Math.floor(Date.now() / 1000)));
	}

	function setToNowMs() {
		setInput(String(Date.now()));
	}

	const controls = (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">输入时间戳或日期</h2>
				<input
					className="password-length-input"
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="如 1700000000、1700000000000 或 2024-01-01"
					aria-label="时间戳输入"
				/>
				<div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
					<Button variant="secondary" onClick={setToNow}>当前（秒）</Button>
					<Button variant="secondary" onClick={setToNowMs}>当前（毫秒）</Button>
				</div>
			</div>
		</div>
	);

	const resultPanel = (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">转换结果</h2>
			{displayResult ? (
				<div style={{ display: 'grid', gap: '6px' }}>
					<CopyRow label="识别" value={INPUT_KIND_LABELS[displayResult.inputKind]} />
					<CopyRow label="Unix 秒" value={String(displayResult.unix)} />
					<CopyRow label="Unix 毫秒" value={String(displayResult.unixMs)} />
					<CopyRow label="ISO" value={displayResult.iso} />
					<CopyRow label="本地" value={displayResult.local} />
					<CopyRow label="UTC" value={displayResult.utc} />
				</div>
			) : (
				<div className="tool-empty-state">输入时间戳或日期后显示转换结果。</div>
			)}
		</div>
	);

	useToolRefPanel('时间格式参考', timestampReference);

	return (
		<GeneratorPanel ariaLabel="时间戳转换工具" controls={controls} result={resultPanel} />
	);
}
