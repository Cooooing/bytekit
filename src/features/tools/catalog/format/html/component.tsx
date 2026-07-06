import { useEffect, useRef } from 'react';
import CodeEditor from '@features/tools/shared/CodeEditor';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue';
import { formatHtml, minifyHtml } from './functions';
import { htmlFormatReference } from './references';
import IoWorkbench from '@features/tools/shared/IoWorkbench';
import { useTheme } from '@themes/ThemeContext';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useAppMessage } from '@shared/ui/AppMessage';

const text = {
	tool: 'HTML 格式化工具',
	input: '输入',
	output: '输出',
	format: '格式化',
	minify: '压缩',
	success: '已同步',
	fail: '输入无效',
	waiting: '等待输入',
	syncing: '更新中',
};

export default function HtmlFormatter() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const lastAutoError = useRef('');
	const [state, setState] = useToolStorage('bytekit:tool:html-format:v1', {
		input: '<!DOCTYPE html><html><head><title>Test</title></head><body><div class="container"><h1>Hello</h1><p>World</p></div></body></html>',
		output: '',
		lastAction: 'format' as 'format' | 'minify',
		lastInput: '',
		error: '',
	});
	const { input, output, lastAction, lastInput } = state;
	const debouncedInput = useDebouncedValue(input, 250);
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));

	function runAction(action: 'format' | 'minify', value = input, auto = false) {
		const result = action === 'format' ? formatHtml(value) : minifyHtml(value);
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

	useToolRefPanel('HTML 格式化参考', htmlFormatReference);

	return (
		<IoWorkbench
			ariaLabel={text.tool}
			actions={(
				<>
					<Button variant={lastAction === 'format' ? 'primary' : 'secondary'} onClick={() => runAction('format')}>{text.format}</Button>
					<Button variant={lastAction === 'minify' ? 'primary' : 'secondary'} onClick={() => runAction('minify')}>{text.minify}</Button>
				</>
			)}
			input={<CodeEditor title={text.input} value={input} onChange={setInput} language="html" />}
			output={<CodeEditor title={text.output} value={output} language="html" status={outputStatus} statusText={outputStatusText} />}
		/>
	);
}
