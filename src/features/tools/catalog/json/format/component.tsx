import { useEffect, useRef } from 'react';
import CodeEditor from '@features/tools/shared/CodeEditor';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue';
import { formatJson, minifyJson, unescapeJson, escapeJson } from './functions';
import { jsonReference } from './references';
import IoWorkbench from '@features/tools/shared/IoWorkbench';
import { useTheme } from '@themes/ThemeContext';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useAppMessage } from '@shared/ui/AppMessage';

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
	waiting: '等待输入',
	syncing: '更新中',
};

export default function JsonFormatter() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const lastAutoError = useRef('');
	const [state, setState] = useToolStorage('bytekit:tool:json:v1', {
		input: '{\n  "name": "bytekit"\n}',
		output: '',
		lastAction: 'format' as 'format' | 'minify' | 'unescape' | 'escape',
		lastInput: '',
		error: '',
	});
	const { input, output, lastAction, lastInput } = state;
	const debouncedInput = useDebouncedValue(input, 250);
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));

	function runAction(action: 'format' | 'minify' | 'unescape' | 'escape', value = input, auto = false) {
		let result;
		switch (action) {
			case 'format': result = formatJson(value, 2); break;
			case 'minify': result = minifyJson(value); break;
			case 'unescape': result = unescapeJson(value); break;
			case 'escape': result = escapeJson(value); break;
		}
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
	const successStatusText = lastAction === 'escape' || lastAction === 'unescape' ? '已转换' : text.valid;
	const outputStatusText = !input.trim() ? text.waiting : state.error ? text.invalid : isDirty ? text.syncing : output ? successStatusText : text.waiting;

	useToolRefPanel('JSON 参考', jsonReference);

	return (
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
			output={<CodeEditor title={text.output} value={output} language="json" status={outputStatus} statusText={outputStatusText} />}
		/>
	);
}
