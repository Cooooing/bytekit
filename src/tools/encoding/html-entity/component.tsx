import { useMemo } from 'react';
import CodeEditor from '../../../components/shared/editor/CodeEditor';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { encodeHtmlEntities, decodeHtmlEntities } from './functions';
import { htmlEntityReference } from './references';
import IoWorkbench from '../../../components/shared/layouts/IoWorkbench';
import { useTheme } from '../../../themes/ThemeContext';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';

const text = {
	tool: 'HTML 实体编解码工具',
	input: '输入',
	output: '输出',
	encode: '编码',
	decode: '解码',
	success: '已转换',
	fail: '转换失败',
};

export default function HtmlEntityCodec() {
	const { Button } = useTheme();
	const [state, setState] = useToolStorage('bytekit:tool:html-entity:v1', {
		input: '<div class="test">Hello & "World"</div>',
		output: '',
		lastAction: 'encode' as 'encode' | 'decode',
	});
	const { input, output, lastAction } = state;
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));

	function runAction(action: 'encode' | 'decode') {
		const result = action === 'encode' ? encodeHtmlEntities(input) : decodeHtmlEntities(input);
		setState((current) => ({
			...current,
			lastAction: action,
			output: result.ok ? result.output : current.output,
		}));
	}

	const encodeResult = useMemo(() => encodeHtmlEntities(input), [input]);

	useToolRefPanel('HTML 实体参考', htmlEntityReference);

	return (
		<>
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
		</>
	);
}
