import { useMemo } from 'react';
import CodeEditor from '../../editor/CodeEditor';
import Button from '../../ui/Button';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { jsonToYaml, yamlToJson } from '../../../lib/tools/format/yaml';
import { IoWorkbench } from '../ToolLayouts';

const text = {
	tool: 'JSON ↔ YAML',
	input: '输入',
	output: '输出',
	toYaml: 'JSON → YAML',
	toJson: 'YAML → JSON',
	success: '转换成功',
	fail: '转换失败',
};

export default function YamlConverter() {
	const [state, setState] = useToolStorage('bytekit:tool:yaml:v1', {
		input: '{\n  "name": "bytekit",\n  "version": "1.0",\n  "features": ["json", "yaml"]\n}',
		output: '',
		lastAction: 'toYaml' as 'toYaml' | 'toJson',
	});
	const { input, output, lastAction } = state;
	const setInput = (v: string) => setState((c) => ({ ...c, input: v }));

	function runAction(action: 'toYaml' | 'toJson') {
		const result = action === 'toYaml' ? jsonToYaml(input) : yamlToJson(input);
		setState((c) => ({ ...c, lastAction: action, output: result.ok ? result.output : c.output }));
	}

	const currentResult = useMemo(() =>
		lastAction === 'toYaml' ? jsonToYaml(input) : yamlToJson(input),
		[input, lastAction]
	);

	return (
		<IoWorkbench
			ariaLabel={text.tool}
			actions={(
				<>
					<Button variant="primary" onClick={() => runAction('toYaml')}>{text.toYaml}</Button>
					<Button variant="secondary" onClick={() => runAction('toJson')}>{text.toJson}</Button>
				</>
			)}
			input={<CodeEditor title={text.input} value={input} onChange={setInput} language="json" />}
			output={<CodeEditor title={text.output} value={output} language="text" status={currentResult.ok ? 'success' : 'error'} statusText={currentResult.ok ? text.success : text.fail} error={currentResult.ok ? undefined : currentResult.error} />}
		/>
	);
}
