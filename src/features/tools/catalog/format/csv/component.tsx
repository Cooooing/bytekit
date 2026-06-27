import CodeEditor from '@features/tools/shared/CodeEditor';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
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
	success: '转换成功',
	fail: '转换失败',
	pending: '待执行',
	dirty: '输入已变化，点击操作按钮更新输出。',
};

export default function CsvConverter() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const [state, setState] = useToolStorage('bytekit:tool:csv:v1', {
		input: '[\n  { "name": "Alice", "age": 30, "city": "北京" },\n  { "name": "Bob", "age": 25, "city": "上海" }\n]',
		output: '',
		lastAction: 'toCsv' as 'toCsv' | 'toJson',
		lastInput: '',
		error: '',
	});
	const { input, output, lastAction, lastInput } = state;
	const setInput = (v: string) => setState((c) => ({ ...c, input: v }));

	function runAction(action: 'toCsv' | 'toJson') {
		const result = action === 'toCsv' ? jsonToCsv(input) : csvToJson(input);
		if (!result.ok) {
			message.error(result.error);
			return;
		}
		setState((c) => ({ ...c, lastAction: action, lastInput: input, output: result.output, error: '' }));
	}

	const isDirty = input !== (lastInput ?? '');
	const hasExecuted = !isDirty && lastInput !== '';
	const outputStatus = !hasExecuted ? 'neutral' : 'success';
	const outputStatusText = !hasExecuted ? text.pending : text.success;

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
			output={<CodeEditor title={text.output} value={output} language="text" status={outputStatus} statusText={outputStatusText} message={isDirty ? text.dirty : undefined} />}
		/>
	);
}
