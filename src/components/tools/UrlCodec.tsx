import { useMemo } from 'react';
import CodeEditor from '../editor/CodeEditor';
import Button from '../ui/Button';
import { useToolStorage } from '../../hooks/useToolStorage';
import { encodeUrl, decodeUrl } from '../../lib/tools/url';
import { IoWorkbench } from './ToolLayouts';

const text = {
	tool: 'URL 编解码工具',
	input: '输入',
	output: '输出',
	encode: '编码',
	decode: '解码',
	success: '已转换',
	fail: '转换失败',
};

export default function UrlCodec() {
	const [state, setState] = useToolStorage('bytekit:tool:url:v1', {
		input: 'https://example.com/path?name=你好&lang=中文',
		output: '',
		lastAction: 'encode' as 'encode' | 'decode',
	});
	const { input, output, lastAction } = state;
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));

	function runAction(action: 'encode' | 'decode') {
		const result = action === 'encode' ? encodeUrl(input) : decodeUrl(input);
		setState((current) => ({
			...current,
			lastAction: action,
			output: result.ok
				? `${action === 'encode' ? '编码' : '解码'}结果:\n${action === 'encode' ? result.encoded : result.decoded}\n\nURL 组件:\n协议: ${result.components.protocol || '(无)'}\n主机: ${result.components.hostname || '(无)'}\n端口: ${result.components.port || '(无)'}\n路径: ${result.components.pathname || '(无)'}\n查询: ${result.components.search || '(无)'}\n哈希: ${result.components.hash || '(无)'}${result.components.params.length > 0 ? '\n\n参数:\n' + result.components.params.map((p) => `  ${p.key} = ${p.value}`).join('\n') : ''}`
				: result.error,
		}));
	}

	const encodeResult = useMemo(() => encodeUrl(input), [input]);

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
