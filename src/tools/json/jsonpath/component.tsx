import { useMemo, useRef } from 'react';
import CodeEditor from '../../../components/shared/editor/CodeEditor';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { evaluateJsonPath } from './functions';
import { jsonPathReference } from './references';
import IoWorkbench from '../../../components/shared/layouts/IoWorkbench';
import { useTheme } from '../../../themes/ThemeContext';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';
import { useAppMessage, useMessageOnError } from '../../../components/shared/ui/AppMessage';

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
	const message = useAppMessage();
	const lastRunError = useRef('');
	const [state, setState] = useToolStorage('bytekit:tool:jsonpath:v1', {
		input: sampleJson,
		expression: '$.store.book[*].title',
		output: '',
		error: '',
		lastInput: '',
		lastExpression: '',
		resultCount: 0,
	});
	const { input, expression, output, lastInput, lastExpression, resultCount } = state;
	const setInput = (value: string) => setState((current) => ({ ...current, input: value, error: '' }));
	const isDirty = input !== (lastInput ?? '') || expression !== (lastExpression ?? '');

	function run() {
		const result = evaluateJsonPath(input, expression);
		if (result.ok) {
			const formatted = JSON.stringify(result.results, null, 2);
			lastRunError.current = '';
			setState((current) => ({ ...current, output: formatted, error: '', lastInput: input, lastExpression: expression, resultCount: result.results.length }));
		} else {
			if (result.error !== lastRunError.current) {
				message.error(result.error);
				lastRunError.current = result.error;
			}
			setState((current) => ({ ...current, error: '' }));
		}
	}

	const formatResult = useMemo(() => {
		if (!input) return { ok: false as const, error: '请输入 JSON 数据' };
		try { JSON.parse(input); return { ok: true as const }; } catch (e) { return { ok: false as const, error: String(e) }; }
	}, [input]);
	const formatError = !formatResult.ok && input.trim() ? formatResult.error : undefined;
	useMessageOnError(formatError && formatError !== lastRunError.current ? formatError : undefined);

	useToolRefPanel('JSONPath 参考', jsonPathReference);

	return (
		<>
			<IoWorkbench
				ariaLabel={text.tool}
				actions={(
					<div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', width: '100%' }}>
						<input
							type="text"
							value={expression}
							placeholder={text.query}
							aria-label={text.query}
							className="tool-input"
							style={{ flex: '1 1 16rem', minWidth: 0 }}
							onChange={(e) => setState((current) => ({ ...current, expression: e.target.value, error: '' }))}
							onKeyDown={(e) => { if (e.key === 'Enter') run(); }}
						/>
						<Button variant="primary" onClick={run}>{text.run}</Button>
						{output && !isDirty ? <span style={{ color: 'var(--muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{resultCount} 个结果</span> : null}
					</div>
				)}
				input={<CodeEditor title={text.input} value={input} onChange={setInput} language="json" />}
				output={<CodeEditor title={text.output} value={output} language="json" status={output && !isDirty ? 'success' : 'neutral'} statusText={output && !isDirty ? `${resultCount} 个结果` : formatResult.ok ? '待执行' : 'JSON 无效'} message={isDirty && formatResult.ok ? '输入已变化，点击执行更新结果。' : undefined} />}
			/>
		</>
	);
}
