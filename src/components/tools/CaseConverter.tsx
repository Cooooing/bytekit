import { useMemo } from 'react';
import CodeEditor from '../editor/CodeEditor';
import Button from '../ui/Button';
import { useToolStorage } from '../../hooks/useToolStorage';
import { toCamelCase, toSnakeCase, toKebabCase, toPascalCase, toUpperCase, toLowerCase } from '../../lib/tools/case';
import { IoWorkbench } from './ToolLayouts';

const text = {
	tool: '大小写转换',
	input: '输入',
	output: '结果',
};

const converters = [
	{ label: 'camelCase', fn: toCamelCase },
	{ label: 'snake_case', fn: toSnakeCase },
	{ label: 'kebab-case', fn: toKebabCase },
	{ label: 'PascalCase', fn: toPascalCase },
	{ label: 'UPPER', fn: toUpperCase },
	{ label: 'lower', fn: toLowerCase },
];

export default function CaseConverter() {
	const [state, setState] = useToolStorage('bytekit:tool:case:v1', {
		input: 'helloWorld',
	});
	const { input } = state;
	const setInput = (v: string) => setState((c) => ({ ...c, input: v }));

	const results = useMemo(() =>
		converters.map((c) => `${c.label}:\n${c.fn(input)}`).join('\n\n'),
		[input]
	);

	return (
		<IoWorkbench
			ariaLabel={text.tool}
			actions={
				<span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
					输入文本后自动转换为各种命名格式。
				</span>
			}
			input={<CodeEditor title={text.input} value={input} onChange={setInput} language="text" />}
			output={<CodeEditor title={text.output} value={results} language="text" />}
		/>
	);
}
