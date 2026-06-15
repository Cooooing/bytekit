import { useMemo, useState } from 'react';
import CopyRow from '../../ui/CopyRow';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { toCamelCase, toSnakeCase, toKebabCase, toPascalCase, toUpperCase, toLowerCase } from '../../../lib/tools/text/case';
import { GeneratorPanel } from '../ToolLayouts';

const converters = [
	{ label: 'camelCase', fn: toCamelCase },
	{ label: 'snake_case', fn: toSnakeCase },
	{ label: 'kebab-case', fn: toKebabCase },
	{ label: 'PascalCase', fn: toPascalCase },
	{ label: 'UPPER', fn: toUpperCase },
	{ label: 'lower', fn: toLowerCase },
];

export default function CaseConverter() {
	const [state, setState] = useToolStorage('bytekit:tool:case:v1', { input: 'helloWorld' });
	const { input } = state;
	const setInput = (v: string) => setState((c) => ({ ...c, input: v }));

	const results = useMemo(() =>
		converters.map((c) => ({ label: c.label, value: c.fn(input) })),
		[input]
	);

	const controls = (
		<div className="password-card password-card--controls">
			<div className="password-card__section">
				<h2 className="password-card__title">输入文本</h2>
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="输入要转换的文本"
					aria-label="输入文本"
					style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-subtle)', color: 'var(--text)', fontFamily: 'monospace', fontSize: '0.875rem' }}
				/>
			</div>
		</div>
	);

	const resultPanel = (
		<div className="password-card password-card--result">
			<h2 className="password-card__title">转换结果</h2>
			{input ? (
				<div style={{ display: 'grid', gap: '6px' }}>
					{results.map((r) => (
						<CopyRow key={r.label} label={r.label} value={r.value} />
					))}
				</div>
			) : (
				<div style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>输入文本后自动转换。</div>
			)}
		</div>
	);

	return <GeneratorPanel ariaLabel="大小写转换工具" controls={controls} result={resultPanel} />;
}
