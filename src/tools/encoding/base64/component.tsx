import CodeEditor from '../../../components/shared/editor/CodeEditor';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { decodeBase64, encodeBase64 } from './functions';
import { base64Reference } from './references';
import IoWorkbench from '../../../components/shared/layouts/IoWorkbench';
import { useTheme } from '../../../themes/ThemeContext';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';
import { useAppMessage } from '../../../components/shared/ui/AppMessage';

const text = {
	tool: 'Base64 编解码工具',
	input: '输入',
	output: '输出',
	encode: '编码',
	decode: '解码',
	success: '已转换',
	fail: '转换失败',
	pending: '待执行',
	dirty: '输入已变化，点击操作按钮更新输出。',
};

export default function Base64Codec() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const [state, setState] = useToolStorage('bytekit:tool:base64:v1', {
		input: 'Bytekit',
		output: '',
		lastAction: 'encode' as 'encode' | 'decode',
		lastInput: '',
		error: '',
	});
	const { input, output, lastAction, lastInput } = state;
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));

	function runAction(action: 'encode' | 'decode') {
		const result = action === 'encode' ? encodeBase64(input) : decodeBase64(input);
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

	useToolRefPanel('Base64 参考', base64Reference);

	return (
		<>
			<IoWorkbench
				ariaLabel={text.tool}
				actions={(
					<>
						<Button variant={lastAction === 'encode' ? 'primary' : 'secondary'} onClick={() => runAction('encode')}>{text.encode}</Button>
						<Button variant={lastAction === 'decode' ? 'primary' : 'secondary'} onClick={() => runAction('decode')}>{text.decode}</Button>
					</>
				)}
				input={<CodeEditor title={text.input} value={input} onChange={setInput} language="text" />}
				output={<CodeEditor title={text.output} value={output} language="text" status={outputStatus} statusText={outputStatusText} message={isDirty ? text.dirty : undefined} />}
			/>
		</>
	);
}
