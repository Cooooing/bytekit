import { useMemo, useState, useCallback } from 'react';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';
import { parseCron } from './functions';
import { cronReference } from './references';
import GeneratorPanel from '../../../components/shared/layouts/GeneratorPanel';
import CopyRow from '../../../components/shared/ui/CopyRow';

const FIELD_LABELS = ['分钟', '小时', '日', '月', '星期'] as const;
const FIELD_KEYS = ['minutes', 'hours', 'daysOfMonth', 'months', 'daysOfWeek'] as const;

export default function CronParser() {
	const [input, setInput] = useState('0 9 * * 1-5');
	const result = useMemo(() => parseCron(input), [input]);

	const controls = (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">Cron 表达式</h2>
				<input
					className="tool-textarea"
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="如 0 9 * * 1-5"
					aria-label="Cron 表达式输入"
				/>
				<p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
					格式：[秒] 分 时 日 月 周
				</p>
			</div>
		</div>
	);

	const resultPanel = (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">解析结果</h2>
			{result.ok ? (
				<div style={{ display: 'grid', gap: 'var(--space-4)' }}>
					{/* Description */}
					<div className="tool-card__section">
						<div className="tool-card__title-row">
							<span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>自然语言描述</span>
						</div>
						<div style={{ fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.5 }}>
							{result.result.description}
						</div>
					</div>

					{/* Next runs */}
					{result.result.nextRuns.length > 0 && (
						<div className="tool-card__section">
							<div className="tool-card__title-row">
								<span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>下次执行时间</span>
							</div>
							<div style={{ display: 'grid', gap: '2px' }}>
								{result.result.nextRuns.map((run, i) => (
									<CopyRow key={i} label={`#${i + 1}`} value={run} />
								))}
							</div>
						</div>
					)}

					{/* Field breakdown */}
					<div className="tool-card__section">
						<div className="tool-card__title-row">
							<span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>字段明细</span>
						</div>
						<div style={{ display: 'grid', gap: 'var(--space-2)' }}>
							{FIELD_KEYS.map((key, i) => (
								<div key={key} style={{
									display: 'grid',
									gridTemplateColumns: '4rem 1fr',
									gap: 'var(--space-2)',
									fontSize: '0.8125rem',
									padding: 'var(--space-2)',
									borderRadius: 'var(--radius-sm)',
									background: 'var(--surface-subtle)',
								}}>
									<span style={{ fontWeight: 600, color: 'var(--muted)' }}>{FIELD_LABELS[i]}</span>
									<span style={{
										fontFamily: 'var(--font-mono)',
										fontSize: '0.75rem',
										wordBreak: 'break-all',
										lineHeight: 1.6,
									}}>
										{result.result.fields[key].join(', ')}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			) : (
				<div className="state-box state-box--error" role="alert">
					{result.error}
				</div>
			)}
		</div>
	);

	useToolRefPanel('Cron 参考', cronReference);

	return (
		<GeneratorPanel ariaLabel="Cron 表达式解析工具" controls={controls} result={resultPanel} />
	);
}
