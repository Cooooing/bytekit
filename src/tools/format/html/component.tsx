import CodeEditor from '../../../components/shared/editor/CodeEditor';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { formatHtml, minifyHtml } from './functions';
import { htmlFormatReference } from './references';
import IoWorkbench from '../../../components/shared/layouts/IoWorkbench';
import { useTheme } from '../../../themes/ThemeContext';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';
import { useAppMessage } from '../../../components/shared/ui/AppMessage';

const text = {
	tool: 'HTML 格式化工具',
	input: '输入',
	output: '输出',
	format: '格式化',
	minify: '压缩',
	success: '格式化成功',
	fail: '格式化失败',
	pending: '待执行',
	dirty: '输入已变化，点击操作按钮更新输出。',
};

export default function HtmlFormatter() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const [state, setState] = useToolStorage('bytekit:tool:html-format:v1', {
		input: '<!DOCTYPE html><html><head><title>Test</title></head><body><div class="container"><h1>Hello</h1><p>World</p></div></body></html>',
		output: '',
		lastAction: 'format' as 'format' | 'minify',
		lastInput: '',
		error: '',
	});
	const { input, output, lastAction, lastInput } = state;
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));

	function runAction(action: 'format' | 'minify') {
		const result = action === 'format' ? formatHtml(input) : minifyHtml(input);
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

	useToolRefPanel('HTML 格式化参考', htmlFormatReference);

	return (
		<>
			<IoWorkbench
				ariaLabel={text.tool}
				actions={(
					<>
						<Button variant={lastAction === 'format' ? 'primary' : 'secondary'} onClick={() => runAction('format')}>{text.format}</Button>
						<Button variant={lastAction === 'minify' ? 'primary' : 'secondary'} onClick={() => runAction('minify')}>{text.minify}</Button>
					</>
				)}
				input={<CodeEditor title={text.input} value={input} onChange={setInput} language="html" />}
				output={<CodeEditor title={text.output} value={output} language="html" status={outputStatus} statusText={outputStatusText} message={isDirty ? text.dirty : undefined} />}
			/>
		</>
	);
}
