import { useMemo, useState } from 'react';
import CopyRow from '../../../components/shared/ui/CopyRow';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { toCamelCase, toSnakeCase, toKebabCase, toPascalCase, toUpperCase, toLowerCase } from './functions';
import { caseReference } from './references';
import GeneratorPanel from '../../../components/shared/layouts/GeneratorPanel';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';

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
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">输入文本</h2>
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="输入要转换的文本"
					aria-label="输入文本"
					className="tool-textarea"
				/>
			</div>
		</div>
	);

	const resultPanel = (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">转换结果</h2>
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

	useToolRefPanel('大小写格式参考', caseReference);

	return <GeneratorPanel ariaLabel="大小写转换工具" controls={controls} result={resultPanel} />;
}
