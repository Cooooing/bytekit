import CodeEditor from '../../../components/shared/editor/CodeEditor';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { jsonToYaml, yamlToJson } from './functions';
import { yamlReference } from './references';
import IoWorkbench from '../../../components/shared/layouts/IoWorkbench';
import { useTheme } from '../../../themes/ThemeContext';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';
import { useAppMessage } from '../../../components/shared/ui/AppMessage';

const text = {
	tool: 'JSON ↔ YAML',
	input: '输入',
	output: '输出',
	toYaml: 'JSON → YAML',
	toJson: 'YAML → JSON',
	success: '转换成功',
	fail: '转换失败',
	pending: '待执行',
	dirty: '输入已变化，点击操作按钮更新输出。',
};

export default function YamlConverter() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const [state, setState] = useToolStorage('bytekit:tool:yaml:v1', {
		input: '{\n  "name": "bytekit",\n  "version": "1.0",\n  "features": ["json", "yaml"]\n}',
		output: '',
		lastAction: 'toYaml' as 'toYaml' | 'toJson',
		lastInput: '',
		error: '',
	});
	const { input, output, lastAction, lastInput } = state;
	const setInput = (v: string) => setState((c) => ({ ...c, input: v }));

	function runAction(action: 'toYaml' | 'toJson') {
		const result = action === 'toYaml' ? jsonToYaml(input) : yamlToJson(input);
		if (!result.ok) {
			message.error(result.error);
			return;
		}
		setState((c) => ({ ...c, lastAction: action, lastInput: input, output: result.output, error: '' }));
	}

	const isDirty = input !== (lastInput ?? '');
	const inputLanguage = lastAction === 'toYaml' ? 'json' : 'text';
	const outputLanguage = lastAction === 'toYaml' ? 'text' : 'json';
	const hasExecuted = !isDirty && lastInput !== '';
	const outputStatus = !hasExecuted ? 'neutral' : 'success';
	const outputStatusText = !hasExecuted ? text.pending : text.success;

	useToolRefPanel('YAML 格式参考', yamlReference);

	return (
		<IoWorkbench
			ariaLabel={text.tool}
			actions={(
				<>
					<Button variant={lastAction === 'toYaml' ? 'primary' : 'secondary'} onClick={() => runAction('toYaml')}>{text.toYaml}</Button>
					<Button variant={lastAction === 'toJson' ? 'primary' : 'secondary'} onClick={() => runAction('toJson')}>{text.toJson}</Button>
				</>
			)}
			input={<CodeEditor title={text.input} value={input} onChange={setInput} language={inputLanguage} />}
			output={<CodeEditor title={text.output} value={output} language={outputLanguage} status={outputStatus} statusText={outputStatusText} message={isDirty ? text.dirty : undefined} />}
		/>
	);
}
