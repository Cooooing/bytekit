import { useEffect, useRef } from 'react';
import CodeEditor from '@features/tools/shared/CodeEditor';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue';
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
	success: '已同步',
	fail: '输入无效',
	waiting: '等待输入',
	syncing: '更新中',
};

export default function CssMinify() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const lastAutoError = useRef('');
	const [state, setState] = useToolStorage('bytekit:tool:css:v1', {
		input: 'body {\n  margin: 0;\n  padding: 0;\n  font-family: sans-serif;\n}\n\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 16px;\n}',
		output: '',
		lastAction: 'minify' as 'minify' | 'beautify',
		lastInput: '',
		error: '',
	});
	const { input, output, lastAction, lastInput } = state;
	const debouncedInput = useDebouncedValue(input, 250);
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));

	function runAction(action: 'minify' | 'beautify', value = input, auto = false) {
		const result = action === 'minify' ? minifyCss(value) : beautifyCss(value);
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
	const outputStatus = state.error ? 'error' : isDirty || !output ? 'neutral' : 'success';
	const outputStatusText = !input.trim() ? text.waiting : state.error ? text.fail : isDirty ? text.syncing : output ? text.success : text.waiting;

	useToolRefPanel('CSS 参考', cssReference);

	return (
		<IoWorkbench
			ariaLabel={text.tool}
			actions={(
				<>
					<Button variant={lastAction === 'minify' ? 'primary' : 'secondary'} onClick={() => runAction('minify')}>{text.minify}</Button>
					<Button variant={lastAction === 'beautify' ? 'primary' : 'secondary'} onClick={() => runAction('beautify')}>{text.beautify}</Button>
				</>
			)}
			input={<CodeEditor title={text.input} value={input} onChange={setInput} language="css" />}
			output={<CodeEditor title={text.output} value={output} language="css" status={outputStatus} statusText={outputStatusText} />}
		/>
	);
}
