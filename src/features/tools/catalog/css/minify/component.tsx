import CodeEditor from '@features/tools/shared/CodeEditor';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { minifyCss, beautifyCss } from './functions';
import { cssReference } from './references';
import IoWorkbench from '@features/tools/shared/IoWorkbench';
import { useTheme } from '@themes/ThemeContext';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useAppMessage } from '@shared/ui/AppMessage';

const text = {
	tool: 'CSS 压缩/美化',
	input: '输入',
	output: '输出',
	minify: '压缩',
	beautify: '美化',
	success: '完成',
	fail: '失败',
	pending: '待执行',
	dirty: '输入已变化，点击操作按钮更新输出。',
};

export default function CssMinify() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const [state, setState] = useToolStorage('bytekit:tool:css:v1', {
		input: 'body {\n  margin: 0;\n  padding: 0;\n  font-family: sans-serif;\n}\n\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 16px;\n}',
		output: '',
		lastAction: 'minify' as 'minify' | 'beautify',
		lastInput: '',
		error: '',
	});
	const { input, output, lastAction, lastInput } = state;
	const setInput = (v: string) => setState((c) => ({ ...c, input: v }));

	function runAction(action: 'minify' | 'beautify') {
		const result = action === 'minify' ? minifyCss(input) : beautifyCss(input);
		if (!result.ok) {
			message.error(result.error);
			return;
		}
		setState((c) => ({ ...c, lastAction: action, lastInput: input, output: result.output, error: '' }));
	}

	const isDirty = input !== (lastInput ?? '');
	const hasExecuted = !isDirty && lastInput !== '';
	const outputStatus = !hasExecuted ? 'neutral' : 'success';
	const outputStatusText = !hasExecuted ? text.pending : text.success;

	useToolRefPanel('CSS 参考', cssReference);

	return (
		<>
			<IoWorkbench
				ariaLabel={text.tool}
				actions={(
					<>
						<Button variant={lastAction === 'minify' ? 'primary' : 'secondary'} onClick={() => runAction('minify')}>{text.minify}</Button>
						<Button variant={lastAction === 'beautify' ? 'primary' : 'secondary'} onClick={() => runAction('beautify')}>{text.beautify}</Button>
					</>
				)}
				input={<CodeEditor title={text.input} value={input} onChange={setInput} language="css" />}
				output={<CodeEditor title={text.output} value={output} language="css" status={outputStatus} statusText={outputStatusText} message={isDirty ? text.dirty : undefined} />}
			/>
		</>
	);
}
