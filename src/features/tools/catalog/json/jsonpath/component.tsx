import { useEffect, useRef } from 'react';
import CodeEditor from '@features/tools/shared/CodeEditor';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue';
import { evaluateJsonPath } from './functions';
import { jsonPathReference } from './references';
import IoWorkbench from '@features/tools/shared/IoWorkbench';
import { useTheme } from '@themes/ThemeContext';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useAppMessage } from '@shared/ui/AppMessage';
import { stringifyJsonLossless } from '@features/tools/shared/losslessJson';

const text = {
	tool: 'JSONPath 测试工具',
	input: 'JSON 数据',
	output: '匹配结果',
	query: 'JSONPath 表达式',
	run: '执行',
	invalid: '输入无效',
	waiting: '等待输入',
	syncing: '更新中',
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
	const lastAutoError = useRef('');
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
	const debouncedInput = useDebouncedValue(input, 250);
	const debouncedExpression = useDebouncedValue(expression, 250);
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));
	const isDirty = input !== (lastInput ?? '') || expression !== (lastExpression ?? '');

	function run(value = input, path = expression, auto = false) {
		const result = evaluateJsonPath(value, path);
		if (result.ok) {
			const formatted = stringifyJsonLossless(result.results, 2);
			lastAutoError.current = '';
			setState((current) => ({ ...current, output: formatted, error: '', lastInput: value, lastExpression: path, resultCount: result.results.length }));
		} else {
			if (!auto || result.error !== lastAutoError.current) message.error(result.error);
			if (auto) lastAutoError.current = result.error;
			setState((current) => ({ ...current, error: result.error }));
		}
	}

	useEffect(() => {
		if (!debouncedInput.trim() || !debouncedExpression.trim()) {
			lastAutoError.current = '';
			setState((current) => ({ ...current, error: '' }));
			return;
		}
		run(debouncedInput, debouncedExpression, true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedInput, debouncedExpression]);

	const outputStatus = state.error ? 'error' : output && !isDirty ? 'success' : 'neutral';
	const outputStatusText = !input.trim() || !expression.trim() ? text.waiting : state.error ? text.invalid : isDirty ? text.syncing : output ? `${resultCount} 个结果` : text.waiting;

	useToolRefPanel('JSONPath 参考', jsonPathReference);

	return (
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
						onChange={(event) => setState((current) => ({ ...current, expression: event.target.value }))}
						onKeyDown={(event) => {
							if (event.key === 'Enter' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) run();
						}}
					/>
					<Button variant="primary" onClick={() => run()}>{text.run}</Button>
					{output && !isDirty && !state.error ? <span style={{ color: 'var(--muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{resultCount} 个结果</span> : null}
				</div>
			)}
			input={<CodeEditor title={text.input} value={input} onChange={setInput} language="json" />}
			output={<CodeEditor title={text.output} value={output} language="json" status={outputStatus} statusText={outputStatusText} />}
		/>
	);
}
