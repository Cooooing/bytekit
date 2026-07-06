import { useEffect, useRef } from 'react';
import CodeEditor from '@features/tools/shared/CodeEditor';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue';
import { decodeBase64, encodeBase64 } from './functions';
import { base64Reference } from './references';
import IoWorkbench from '@features/tools/shared/IoWorkbench';
import { useTheme } from '@themes/ThemeContext';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useAppMessage } from '@shared/ui/AppMessage';

const text = {
	tool: 'Base64 编解码工具',
	input: '输入',
	output: '输出',
	encode: '编码',
	decode: '解码',
	success: '已同步',
	fail: '输入无效',
	waiting: '等待输入',
	syncing: '更新中',
};

export default function Base64Codec() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const lastAutoError = useRef('');
	const [state, setState] = useToolStorage('bytekit:tool:base64:v1', {
		input: 'Bytekit',
		output: '',
		lastAction: 'encode' as 'encode' | 'decode',
		lastInput: '',
		error: '',
	});
	const { input, output, lastAction, lastInput } = state;
	const debouncedInput = useDebouncedValue(input, 250);
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));

	function runAction(action: 'encode' | 'decode', value = input, auto = false) {
		const result = action === 'encode' ? encodeBase64(value) : decodeBase64(value);
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

	useToolRefPanel('Base64 参考', base64Reference);

	return (
		<IoWorkbench
			ariaLabel={text.tool}
			actions={(
				<>
					<Button variant={lastAction === 'encode' ? 'primary' : 'secondary'} onClick={() => runAction('encode')}>{text.encode}</Button>
					<Button variant={lastAction === 'decode' ? 'primary' : 'secondary'} onClick={() => runAction('decode')}>{text.decode}</Button>
				</>
			)}
			input={<CodeEditor title={text.input} value={input} onChange={setInput} language="text" />}
			output={<CodeEditor title={text.output} value={output} language="text" status={outputStatus} statusText={outputStatusText} />}
		/>
	);
}
