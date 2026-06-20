import { useEffect, useRef, useState } from 'react';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';
import { parseCron, type CronResult } from './functions';
import { cronReference } from './references';
import GeneratorPanel from '../../../components/shared/layouts/GeneratorPanel';
import CopyRow from '../../../components/shared/ui/CopyRow';
import { useAppMessage } from '../../../components/shared/ui/AppMessage';

export default function CronParser() {
	const message = useAppMessage();
	const [input, setInput] = useState('0 9 * * 1-5');
	const [lastResult, setLastResult] = useState<CronResult | null>(null);
	const lastError = useRef('');

	useEffect(() => {
		const timer = window.setTimeout(() => {
			const result = parseCron(input);
			if (result.ok) {
				setLastResult(result.result);
				lastError.current = '';
				return;
			}
			setLastResult(null);
			if (result.error !== lastError.current) {
				message.error(result.error);
				lastError.current = result.error;
			}
		}, 250);
		return () => window.clearTimeout(timer);
	}, [input, message]);

	const controls = (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">Cron 表达式</h2>
				<input
					className="tool-textarea"
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="如 0 9 * * 1-5 或 0 0 9 ? * MON-FRI"
					aria-label="Cron 表达式输入"
				/>
				<p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
					支持 5/6/7 字段，自动识别 Unix、Quartz、Spring 风格。
				</p>
			</div>
		</div>
	);

	const resultPanel = (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">解析结果</h2>
			{lastResult ? (
				<div style={{ display: 'grid', gap: 'var(--space-4)' }}>
					<div className="tool-card__section">
						<div className="tool-card__title-row">
							<span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>识别规范</span>
						</div>
						<div style={{ fontSize: '1rem', fontWeight: 650, lineHeight: 1.5 }}>
							{lastResult.dialect}
						</div>
						<div style={{ marginTop: 'var(--space-2)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)', overflowWrap: 'anywhere' }}>
							{lastResult.expression}
						</div>
					</div>

					<div className="tool-card__section">
						<div className="tool-card__title-row">
							<span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>自然语言描述</span>
						</div>
						<div style={{ fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.5 }}>
							{lastResult.description}
						</div>
					</div>

					<div className="tool-card__section">
						<div className="tool-card__title-row">
							<span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>下次执行时间</span>
						</div>
						<div style={{ display: 'grid', gap: '2px' }}>
							{lastResult.nextRuns.map((run, i) => (
								<CopyRow key={i} label={`#${i + 1}`} value={run} />
							))}
						</div>
					</div>

					<div className="tool-card__section">
						<div className="tool-card__title-row">
							<span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>字段明细</span>
						</div>
						<div style={{ display: 'grid', gap: 'var(--space-2)' }}>
							{lastResult.fields.map((field) => (
								<div key={field.label} style={{
									display: 'grid',
									gridTemplateColumns: '4rem 1fr',
									gap: 'var(--space-2)',
									fontSize: '0.8125rem',
									padding: 'var(--space-2)',
									borderRadius: 'var(--radius-sm)',
									background: 'var(--surface-subtle)',
								}}>
									<span style={{ fontWeight: 600, color: 'var(--muted)' }}>{field.label}</span>
									<span style={{
										fontFamily: 'var(--font-mono)',
										fontSize: '0.75rem',
										wordBreak: 'break-all',
										lineHeight: 1.6,
									}}>
										{field.value}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			) : (
				<div className="state-box">输入 Cron 表达式后显示解析结果。</div>
			)}
		</div>
	);

	useToolRefPanel('Cron 参考', cronReference);

	return (
		<GeneratorPanel ariaLabel="Cron 表达式解析工具" controls={controls} result={resultPanel} />
	);
}
