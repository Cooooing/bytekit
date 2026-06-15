import { useMemo } from 'react';
import CodeEditor from '../editor/CodeEditor';
import Button from '../ui/Button';
import { useToolStorage } from '../../hooks/useToolStorage';
import { jsonToCsv, csvToJson } from '../../lib/tools/csv';
import { IoWorkbench } from './ToolLayouts';

const text = {
	tool: 'JSON ↔ CSV',
	input: '输入',
	output: '输出',
	toCsv: 'JSON → CSV',
	toJson: 'CSV → JSON',
	success: '转换成功',
	fail: '转换失败',
};

export default function CsvConverter() {
	const [state, setState] = useToolStorage('bytekit:tool:csv:v1', {
		input: '[\n  { "name": "Alice", "age": 30, "city": "北京" },\n  { "name": "Bob", "age": 25, "city": "上海" }\n]',
		output: '',
		lastAction: 'toCsv' as 'toCsv' | 'toJson',
	});
	const { input, output, lastAction } = state;
	const setInput = (v: string) => setState((c) => ({ ...c, input: v }));

	function runAction(action: 'toCsv' | 'toJson') {
		const result = action === 'toCsv' ? jsonToCsv(input) : csvToJson(input);
		setState((c) => ({ ...c, lastAction: action, output: result.ok ? result.output : c.output }));
	}

	const currentResult = useMemo(() =>
		lastAction === 'toCsv' ? jsonToCsv(input) : csvToJson(input),
		[input, lastAction]
	);

	return (
		<IoWorkbench
			ariaLabel={text.tool}
			actions={(
				<>
					<Button variant="primary" onClick={() => runAction('toCsv')}>{text.toCsv}</Button>
					<Button variant="secondary" onClick={() => runAction('toJson')}>{text.toJson}</Button>
				</>
			)}
			input={<CodeEditor title={text.input} value={input} onChange={setInput} language="text" />}
			output={<CodeEditor title={text.output} value={output} language="text" status={currentResult.ok ? 'success' : 'error'} statusText={currentResult.ok ? text.success : text.fail} error={currentResult.ok ? undefined : currentResult.error} />}
		/>
	);
}
