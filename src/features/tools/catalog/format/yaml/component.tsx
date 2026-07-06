import { useEffect, useRef } from 'react';
import CodeEditor from '@features/tools/shared/CodeEditor';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue';
import { jsonToYaml, yamlToJson } from './functions';
import { yamlReference } from './references';
import IoWorkbench from '@features/tools/shared/IoWorkbench';
import { useTheme } from '@themes/ThemeContext';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useAppMessage } from '@shared/ui/AppMessage';

const text = {
	tool: 'JSON ↔ YAML',
	input: '输入',
	output: '输出',
	toYaml: 'JSON → YAML',
	toJson: 'YAML → JSON',
	success: '已同步',
	fail: '输入无效',
	waiting: '等待输入',
	syncing: '更新中',
};

export default function YamlConverter() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const lastAutoError = useRef('');
	const [state, setState] = useToolStorage('bytekit:tool:yaml:v1', {
		input: '{\n  "name": "bytekit",\n  "version": "1.0",\n  "features": ["json", "yaml"]\n}',
		output: '',
		lastAction: 'toYaml' as 'toYaml' | 'toJson',
		lastInput: '',
		error: '',
	});
	const { input, output, lastAction, lastInput } = state;
	const debouncedInput = useDebouncedValue(input, 250);
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));

	function runAction(action: 'toYaml' | 'toJson', value = input, auto = false) {
		const result = action === 'toYaml' ? jsonToYaml(value) : yamlToJson(value);
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
	const inputLanguage = lastAction === 'toYaml' ? 'json' : 'text';
	const outputLanguage = lastAction === 'toYaml' ? 'text' : 'json';
	const outputStatus = state.error ? 'error' : isDirty || !output ? 'neutral' : 'success';
	const outputStatusText = !input.trim() ? text.waiting : state.error ? text.fail : isDirty ? text.syncing : output ? text.success : text.waiting;

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
			output={<CodeEditor title={text.output} value={output} language={outputLanguage} status={outputStatus} statusText={outputStatusText} />}
		/>
	);
}
