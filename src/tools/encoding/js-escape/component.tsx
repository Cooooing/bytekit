import { useMemo } from 'react';
import CodeEditor from '../../../components/shared/editor/CodeEditor';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { escapeJsString, unescapeJsString } from './functions';
import { jsEscapeReference } from './references';
import IoWorkbench from '../../../components/shared/layouts/IoWorkbench';
import { useTheme } from '../../../themes/ThemeContext';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';

const text = {
	tool: 'JavaScript 转义工具',
	input: '输入',
	output: '输出',
	escape: '转义',
	unescape: '反转义',
	success: '已转换',
	fail: '转换失败',
};

export default function JsEscapeCodec() {
	const { Button } = useTheme();
	const [state, setState] = useToolStorage('bytekit:tool:js-escape:v1', {
		input: 'const msg = "Hello\nWorld\tTab\\Backslash"',
		output: '',
		lastAction: 'escape' as 'escape' | 'unescape',
	});
	const { input, output, lastAction } = state;
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));

	function runAction(action: 'escape' | 'unescape') {
		const result = action === 'escape' ? escapeJsString(input) : unescapeJsString(input);
		setState((current) => ({
			...current,
			lastAction: action,
			output: result.ok ? result.output : current.output,
		}));
	}

	const encodeResult = useMemo(() => escapeJsString(input), [input]);

	useToolRefPanel('JavaScript 转义参考', jsEscapeReference);

	return (
		<>
			<IoWorkbench
				ariaLabel={text.tool}
				actions={(
					<>
						<Button variant="primary" onClick={() => runAction('escape')}>{text.escape}</Button>
						<Button variant="secondary" onClick={() => runAction('unescape')}>{text.unescape}</Button>
					</>
				)}
				input={<CodeEditor title={text.input} value={input} onChange={setInput} language="text" />}
				output={<CodeEditor title={text.output} value={output} language="text" status={encodeResult.ok ? 'success' : 'error'} statusText={encodeResult.ok ? text.success : text.fail} error={encodeResult.ok ? undefined : encodeResult.error} />}
			/>
		</>
	);
}
