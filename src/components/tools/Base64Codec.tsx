import { useMemo } from 'react';
import CodeEditor from '../editor/CodeEditor';
import Button from '../ui/Button';
import { useToolStorage } from '../../hooks/useToolStorage';
import { decodeBase64, encodeBase64 } from '../../lib/tools/base64';
import { IoWorkbench } from './ToolLayouts';

const text = {
	tool: 'Base64 编解码工具',
	input: '输入',
	output: '输出',
	encode: '编码',
	decode: '解码',
	success: '已转换',
	fail: '转换失败',
};

export default function Base64Codec() {
	const [state, setState] = useToolStorage('bytekit:tool:base64:v1', {
		input: 'Bytekit',
		output: '',
		lastAction: 'encode' as 'encode' | 'decode',
	});
	const { input, output, lastAction } = state;
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));

	function runAction(action: 'encode' | 'decode') {
		const result = action === 'encode' ? encodeBase64(input) : decodeBase64(input);
		setState((current) => ({
			...current,
			lastAction: action,
			output: result.ok ? result.output : current.output,
		}));
	}

	const encodeResult = useMemo(() => encodeBase64(input), [input]);

	return (
		<IoWorkbench
			ariaLabel={text.tool}
			actions={(
				<>
					<Button variant="primary" onClick={() => runAction('encode')}>{text.encode}</Button>
					<Button variant="secondary" onClick={() => runAction('decode')}>{text.decode}</Button>
				</>
			)}
			input={<CodeEditor title={text.input} value={input} onChange={setInput} language="text" />}
			output={<CodeEditor title={text.output} value={output} language="text" status={encodeResult.ok ? 'success' : 'error'} statusText={encodeResult.ok ? text.success : text.fail} error={encodeResult.ok ? undefined : encodeResult.error} />}
		/>
	);
}
