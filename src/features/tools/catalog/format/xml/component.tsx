import { useEffect, useRef } from 'react';
import CodeEditor from '@features/tools/shared/CodeEditor';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue';
import { formatXml, minifyXml } from './functions';
import { xmlReference } from './references';
import IoWorkbench from '@features/tools/shared/IoWorkbench';
import { useTheme } from '@themes/ThemeContext';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useAppMessage } from '@shared/ui/AppMessage';

const text = {
	tool: 'XML 格式化工具',
	input: '输入',
	output: '输出',
	format: '格式化',
	minify: '压缩',
	valid: '有效 XML',
	invalid: '输入无效',
	waiting: '等待输入',
	syncing: '更新中',
};

export default function XmlFormatter() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const lastAutoError = useRef('');
	const [state, setState] = useToolStorage('bytekit:tool:xml:v1', {
		input: '<root>\n  <item name="hello">\n    <value>world</value>\n  </item>\n</root>',
		output: '',
		lastAction: 'format' as 'format' | 'minify',
		lastInput: '',
		error: '',
	});
	const { input, output, lastInput, lastAction = 'format' } = state;
	const debouncedInput = useDebouncedValue(input, 250);
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));

	function runAction(action: 'format' | 'minify', value = input, auto = false) {
		const result = action === 'format' ? formatXml(value) : minifyXml(value);
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
	const outputStatusText = !input.trim() ? text.waiting : state.error ? text.invalid : isDirty ? text.syncing : output ? text.valid : text.waiting;

	useToolRefPanel('XML 参考', xmlReference);

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
