import { useEffect, useRef } from 'react';
import CodeEditor from '@features/tools/shared/CodeEditor';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue';
import { jsonToCsv, csvToJson } from './functions';
import { csvReference } from './references';
import IoWorkbench from '@features/tools/shared/IoWorkbench';
import { useTheme } from '@themes/ThemeContext';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useAppMessage } from '@shared/ui/AppMessage';

const text = {
	tool: 'JSON ↔ CSV',
	input: '输入',
	output: '输出',
	toCsv: 'JSON → CSV',
	toJson: 'CSV → JSON',
	success: '已同步',
	fail: '输入无效',
	waiting: '等待输入',
	syncing: '更新中',
};

export default function CsvConverter() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const lastAutoError = useRef('');
	const [state, setState] = useToolStorage('bytekit:tool:csv:v1', {
		input: '[\n  { "name": "Alice", "age": 30, "city": "北京" },\n  { "name": "Bob", "age": 25, "city": "上海" }\n]',
		output: '',
		lastAction: 'toCsv' as 'toCsv' | 'toJson',
		lastInput: '',
		error: '',
	});
	const { input, output, lastAction, lastInput } = state;
	const debouncedInput = useDebouncedValue(input, 250);
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));

	function runAction(action: 'toCsv' | 'toJson', value = input, auto = false) {
		const result = action === 'toCsv' ? jsonToCsv(value) : csvToJson(value);
		if (!result.ok) {
			if (!auto || result.error !== lastAutoError.current) message.error(result.error);
			if (auto) lastAutoError.current = result.error;
			setState((current) => ({ ...current, lastAction: action, error: result.error }));
			return;
		}
		lastAutoError.current = '';
		setState((current) => ({ ...current, lastAction: action, lastInput: value, output: result.output, error: '' }));
	}

	useEffect(() => {
		if (!debouncedInput.trim()) {
			lastAutoError.current = '';
			setState((current) => ({ ...current, error: '' }));
			return;
		}
		runAction(lastAction, debouncedInput, true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedInput, lastAction]);

	const isDirty = input !== (lastInput ?? '');
	const outputStatus = state.error ? 'error' : isDirty || !output ? 'neutral' : 'success';
	const outputStatusText = !input.trim() ? text.waiting : state.error ? text.fail : isDirty ? text.syncing : output ? text.success : text.waiting;

	useToolRefPanel('CSV 格式参考', csvReference);

	return (
		<IoWorkbench
			ariaLabel={text.tool}
			actions={(
				<>
					<Button variant={lastAction === 'toCsv' ? 'primary' : 'secondary'} onClick={() => runAction('toCsv')}>{text.toCsv}</Button>
					<Button variant={lastAction === 'toJson' ? 'primary' : 'secondary'} onClick={() => runAction('toJson')}>{text.toJson}</Button>
				</>
			)}
			input={<CodeEditor title={text.input} value={input} onChange={setInput} language="text" />}
			output={<CodeEditor title={text.output} value={output} language="text" status={outputStatus} statusText={outputStatusText} />}
		/>
	);
}
