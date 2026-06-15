import { useMemo, useState } from 'react';
import CodeEditor from '../editor/CodeEditor';
import Badge from '../ui/Badge';
import CopyRow from '../ui/CopyRow';
import { useToolStorage } from '../../hooks/useToolStorage';
import { testRegex } from '../../lib/tools/regex';
import { GeneratorPanel } from './ToolLayouts';

export default function RegexTester() {
	const [state, setState] = useToolStorage('bytekit:tool:regex:v1', {
		input: 'Hello World 123\nfoo@bar.com\n2024-01-15',
		pattern: '\\d+',
		flags: 'g',
	});
	const { input, pattern, flags } = state;
	const setInput = (v: string) => setState((c) => ({ ...c, input: v }));
	const setPattern = (v: string) => setState((c) => ({ ...c, pattern: v }));
	const setFlags = (v: string) => setState((c) => ({ ...c, flags: v }));

	const result = useMemo(() => testRegex(pattern, flags, input), [pattern, flags, input]);

	const controls = (
		<div className="password-card password-card--controls">
			<div className="password-card__section">
				<h2 className="password-card__title">正则表达式</h2>
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
					<span style={{ color: 'var(--muted)' }}>/</span>
					<input
						type="text"
						value={pattern}
						onChange={(e) => setPattern(e.target.value)}
						placeholder="正则表达式"
						aria-label="正则表达式"
						style={{ flex: 1, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-subtle)', color: 'var(--text)', fontFamily: 'monospace', fontSize: '0.875rem' }}
					/>
					<span style={{ color: 'var(--muted)' }}>/</span>
					<input
						type="text"
						value={flags}
						onChange={(e) => setFlags(e.target.value)}
						placeholder="g"
						aria-label="正则标志"
						style={{ width: '3rem', padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-subtle)', color: 'var(--text)', fontFamily: 'monospace', fontSize: '0.875rem' }}
					/>
				</div>
				<CodeEditor title="输入文本" value={input} onChange={setInput} language="text" minHeight="compact" />
			</div>
		</div>
	);

	const resultPanel = (
		<div className="password-card password-card--result">
			<div className="password-card__title-row">
				<h2 className="password-card__title">匹配结果</h2>
				{result.ok ? <Badge tone="success">{result.count} 个匹配</Badge> : <Badge tone="danger">错误</Badge>}
			</div>
			{result.ok ? (
				result.matches.length > 0 ? (
					<div style={{ display: 'grid', gap: '6px' }}>
						{result.matches.map((m, i) => (
							<div key={i}>
								<CopyRow label={`匹配 ${i + 1}`} value={m.fullMatch} />
								{m.groups.length > 0 && (
									<div style={{ paddingLeft: '2rem', display: 'grid', gap: '2px', marginTop: '4px' }}>
										{m.groups.map((g, j) => (
											<CopyRow key={j} label={`$${j + 1}`} value={g} />
										))}
									</div>
								)}
							</div>
						))}
					</div>
				) : (
					<div style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>无匹配结果。</div>
				)
			) : (
				<div style={{ color: 'var(--semantic-danger)', fontSize: '0.875rem' }}>{result.error}</div>
			)}
		</div>
	);

	return <GeneratorPanel ariaLabel="正则表达式测试" controls={controls} result={resultPanel} />;
}
