import { useMemo } from 'react';
import CodeEditor from '../editor/CodeEditor';
import Button from '../ui/Button';
import { useToolStorage } from '../../hooks/useToolStorage';
import { formatJson, minifyJson, unescapeJson, escapeJson } from '../../lib/tools/json';
import { IoWorkbench } from './ToolLayouts';

const text = {
	tool: 'JSON 格式化工具',
	input: '输入',
	output: '输出',
	format: '格式化',
	minify: '压缩',
	unescape: '去转义',
	escape: '转义',
	valid: '有效 JSON',
	invalid: '解析失败',
};

export default function JsonFormatter() {
	const [state, setState] = useToolStorage('bytekit:tool:json:v1', {
		input: '{\n  "name": "bytekit"\n}',
		output: '',
		lastAction: 'format' as 'format' | 'minify' | 'unescape' | 'escape',
	});
	const { input, output, lastAction } = state;
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));

	function runAction(action: 'format' | 'minify' | 'unescape' | 'escape') {
		let result;
		switch (action) {
			case 'format': result = formatJson(input, 2); break;
			case 'minify': result = minifyJson(input); break;
			case 'unescape': result = unescapeJson(input); break;
			case 'escape': result = escapeJson(input); break;
		}
		setState((current) => ({
			...current,
			lastAction: action,
			output: result.ok ? result.output : current.output,
		}));
	}

	const formatResult = useMemo(() => formatJson(input, 2), [input]);

	return (
		<IoWorkbench
			ariaLabel={text.tool}
			actions={(
				<>
					<Button variant="primary" onClick={() => runAction('format')}>{text.format}</Button>
					<Button variant="secondary" onClick={() => runAction('minify')}>{text.minify}</Button>
					<Button variant="secondary" onClick={() => runAction('unescape')}>{text.unescape}</Button>
					<Button variant="secondary" onClick={() => runAction('escape')}>{text.escape}</Button>
				</>
			)}
			input={<CodeEditor title={text.input} value={input} onChange={setInput} language="json" />}
			output={<CodeEditor title={text.output} value={output} language="json" status={formatResult.ok ? 'success' : 'error'} statusText={formatResult.ok ? text.valid : text.invalid} error={formatResult.ok ? undefined : formatResult.error} />}
		/>
	);
}
