import { useMemo, useState } from 'react';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';
import { parseCron } from './functions';
import { cronReference } from './references';
import GeneratorPanel from '../../../components/shared/layouts/GeneratorPanel';

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
					className="password-length-input"
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="如 0 9 * * 1-5"
					aria-label="Cron 表达式输入"
				/>
				<p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '6px' }}>
					格式：分 时 日 月 周
				</p>
			</div>
		</div>
	);

	const resultPanel = (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">解析结果</h2>
			{result.ok ? (
				<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
					{/* Description */}
					<div>
						<div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '4px' }}>自然语言描述</div>
						<div style={{ fontSize: '1rem', fontWeight: 600 }}>{result.result.description}</div>
					</div>

					{/* Next runs */}
					{result.result.nextRuns.length > 0 && (
						<div>
							<div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '4px' }}>下次执行时间</div>
							<ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
								{result.result.nextRuns.map((run, i) => (
									<li key={i} style={{ fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>{run}</li>
								))}
							</ul>
						</div>
					)}

					{/* Field breakdown */}
					<div>
						<div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '4px' }}>字段明细</div>
						<div style={{ display: 'grid', gap: '4px' }}>
							{FIELD_KEYS.map((key, i) => (
								<div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
									<span>{FIELD_LABELS[i]}</span>
									<span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
										{result.result.fields[key].join(', ')}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			) : (
				<div style={{ color: 'var(--semantic-danger)' }}>{result.error}</div>
			)}
		</div>
	);

	useToolRefPanel('Cron 参考', cronReference);

	return (
		<GeneratorPanel ariaLabel="Cron 表达式解析工具" controls={controls} result={resultPanel} />
	);
}
