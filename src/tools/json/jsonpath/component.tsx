import { useMemo, useState } from 'react';
import CodeEditor from '../../../components/shared/editor/CodeEditor';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { evaluateJsonPath } from './functions';
import { jsonPathReference } from './references';
import IoWorkbench from '../../../components/shared/layouts/IoWorkbench';
import { useTheme } from '../../../themes/ThemeContext';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';

const text = {
	tool: 'JSONPath 测试工具',
	input: 'JSON 数据',
	output: '匹配结果',
	query: 'JSONPath 表达式',
	run: '执行',
};

const sampleJson = JSON.stringify({
	store: {
		book: [
			{ title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 10.99 },
			{ title: '1984', author: 'George Orwell', price: 8.99 },
			{ title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 12.99 },
		],
	},
}, null, 2);

export default function JsonPathTester() {
	const { Button } = useTheme();
	const [state, setState] = useToolStorage('bytekit:tool:jsonpath:v1', {
		input: sampleJson,
		expression: '$.store.book[*].title',
		output: '',
		error: '',
	});
	const { input, expression, output, error } = state;
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));
	const [resultCount, setResultCount] = useState(0);

	function run() {
		const result = evaluateJsonPath(input, expression);
		if (result.ok) {
			const formatted = JSON.stringify(result.results, null, 2);
			setState((current) => ({ ...current, output: formatted, error: '' }));
			setResultCount(result.results.length);
		} else {
			setState((current) => ({ ...current, output: '', error: result.error }));
			setResultCount(0);
		}
	}

	const formatResult = useMemo(() => {
		if (!input) return { ok: false as const, error: '请输入 JSON 数据' };
		try { JSON.parse(input); return { ok: true as const }; } catch (e) { return { ok: false as const, error: String(e) }; }
	}, [input]);

	useToolRefPanel('JSONPath 参考', jsonPathReference);

	return (
		<>
			<IoWorkbench
				ariaLabel={text.tool}
				actions={(
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
						<input
							type="text"
							value={expression}
							onChange={(e) => setState((current) => ({ ...current, expression: e.target.value }))}
							placeholder={text.query}
							aria-label={text.query}
							className="tool-input"
							style={{ flex: 1 }}
							onKeyDown={(e) => { if (e.key === 'Enter') run(); }}
						/>
						<Button variant="primary" onClick={run}>{text.run}</Button>
						{output && !error && <span style={{ color: 'var(--muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{resultCount} 个结果</span>}
					</div>
				)}
				input={<CodeEditor title={text.input} value={input} onChange={setInput} language="json" />}
				output={<CodeEditor title={text.output} value={error || output} language="json" status={!error && output ? 'success' : error ? 'error' : formatResult.ok ? 'success' : 'error'} statusText={error ? '错误' : resultCount > 0 ? `${resultCount} 个结果` : formatResult.ok ? '就绪' : 'JSON 无效'} error={error || (!formatResult.ok ? formatResult.error : undefined)} />}
			/>
		</>
	);
}
