import CodeEditor from '@features/tools/shared/CodeEditor';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { encodeHtmlEntities, decodeHtmlEntities } from './functions';
import { htmlEntityReference } from './references';
import IoWorkbench from '@features/tools/shared/IoWorkbench';
import { useTheme } from '@themes/ThemeContext';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useAppMessage } from '@shared/ui/AppMessage';

const text = {
	tool: 'HTML 实体编解码工具',
	input: '输入',
	output: '输出',
	encode: '编码',
	decode: '解码',
	success: '已转换',
	fail: '转换失败',
	pending: '待执行',
	dirty: '输入已变化，点击操作按钮更新输出。',
};

export default function HtmlEntityCodec() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const [state, setState] = useToolStorage('bytekit:tool:html-entity:v1', {
		input: '<div class="test">Hello & "World"</div>',
		output: '',
		lastAction: 'encode' as 'encode' | 'decode',
		lastInput: '',
		error: '',
	});
	const { input, output, lastAction, lastInput } = state;
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));

	function runAction(action: 'encode' | 'decode') {
		const result = action === 'encode' ? encodeHtmlEntities(input) : decodeHtmlEntities(input);
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

	useToolRefPanel('HTML 实体参考', htmlEntityReference);

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
