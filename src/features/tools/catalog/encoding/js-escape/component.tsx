import CodeEditor from '@features/tools/shared/CodeEditor';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { escapeJsString, unescapeJsString } from './functions';
import { jsEscapeReference } from './references';
import IoWorkbench from '@features/tools/shared/IoWorkbench';
import { useTheme } from '@themes/ThemeContext';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useAppMessage } from '@shared/ui/AppMessage';

const text = {
	tool: 'JavaScript 转义工具',
	input: '输入',
	output: '输出',
	escape: '转义',
	unescape: '反转义',
	success: '已转换',
	fail: '转换失败',
	pending: '待执行',
	dirty: '输入已变化，点击操作按钮更新输出。',
};

export default function JsEscapeCodec() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const [state, setState] = useToolStorage('bytekit:tool:js-escape:v1', {
		input: 'const msg = "Hello\nWorld\tTab\\Backslash"',
		output: '',
		lastAction: 'escape' as 'escape' | 'unescape',
		lastInput: '',
		error: '',
	});
	const { input, output, lastAction, lastInput } = state;
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));

	function runAction(action: 'escape' | 'unescape') {
		const result = action === 'escape' ? escapeJsString(input) : unescapeJsString(input);
		if (!result.ok) {
			message.error(result.error);
			return;
		}
		setState((current) => ({ ...current, lastAction: action, lastInput: input, output: result.output, error: '' }));
	}

	const isDirty = input !== (lastInput ?? '');
	const hasExecuted = !isDirty && lastInput !== '';
	const outputStatus = !hasExecuted ? 'neutral' : 'success';
	const outputStatusText = !hasExecuted ? text.pending : text.success;

	useToolRefPanel('JavaScript 转义参考', jsEscapeReference);

	return (
		<>
			<IoWorkbench
				ariaLabel={text.tool}
				actions={(
					<>
						<Button variant={lastAction === 'escape' ? 'primary' : 'secondary'} onClick={() => runAction('escape')}>{text.escape}</Button>
						<Button variant={lastAction === 'unescape' ? 'primary' : 'secondary'} onClick={() => runAction('unescape')}>{text.unescape}</Button>
					</>
				)}
				input={<CodeEditor title={text.input} value={input} onChange={setInput} language="text" />}
				output={<CodeEditor title={text.output} value={output} language="text" status={outputStatus} statusText={outputStatusText} message={isDirty ? text.dirty : undefined} />}
			/>
		</>
	);
}
