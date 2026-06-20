import CodeEditor from '../../../components/shared/editor/CodeEditor';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { formatJson, minifyJson, unescapeJson, escapeJson } from './functions';
import { jsonReference } from './references';
import IoWorkbench from '../../../components/shared/layouts/IoWorkbench';
import { useTheme } from '../../../themes/ThemeContext';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';
import { useAppMessage } from '../../../components/shared/ui/AppMessage';

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
	pending: '待执行',
	dirty: '输入已变化，点击操作按钮更新输出。',
};

export default function JsonFormatter() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const [state, setState] = useToolStorage('bytekit:tool:json:v1', {
		input: '{\n  "name": "bytekit"\n}',
		output: '',
		lastAction: 'format' as 'format' | 'minify' | 'unescape' | 'escape',
		lastInput: '',
		error: '',
	});
	const { input, output, lastAction, lastInput } = state;
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));

	function runAction(action: 'format' | 'minify' | 'unescape' | 'escape') {
		let result;
		switch (action) {
			case 'format': result = formatJson(input, 2); break;
			case 'minify': result = minifyJson(input); break;
			case 'unescape': result = unescapeJson(input); break;
			case 'escape': result = escapeJson(input); break;
		}
		if (!result.ok) {
			message.error(result.error);
			return;
		}
		setState((current) => ({ ...current, lastAction: action, lastInput: input, output: result.output, error: '' }));
	}

	const isDirty = input !== (lastInput ?? '');
	const outputStatus = isDirty || !output ? 'neutral' : 'success';
	const successStatusText = lastAction === 'escape' || lastAction === 'unescape' ? '已转换' : text.valid;
	const outputStatusText = isDirty || !output ? text.pending : successStatusText;

	useToolRefPanel('JSON 参考', jsonReference);

	return (
		<>
			<IoWorkbench
				ariaLabel={text.tool}
				actions={(
					<>
						<Button variant={lastAction === 'format' ? 'primary' : 'secondary'} onClick={() => runAction('format')}>{text.format}</Button>
						<Button variant={lastAction === 'minify' ? 'primary' : 'secondary'} onClick={() => runAction('minify')}>{text.minify}</Button>
						<Button variant={lastAction === 'unescape' ? 'primary' : 'secondary'} onClick={() => runAction('unescape')}>{text.unescape}</Button>
						<Button variant={lastAction === 'escape' ? 'primary' : 'secondary'} onClick={() => runAction('escape')}>{text.escape}</Button>
					</>
				)}
				input={<CodeEditor title={text.input} value={input} onChange={setInput} language="json" />}
				output={<CodeEditor title={text.output} value={output} language="json" status={outputStatus} statusText={outputStatusText} message={isDirty ? text.dirty : undefined} />}
			/>
		</>
	);
}
