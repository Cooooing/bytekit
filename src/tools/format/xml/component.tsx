import CodeEditor from '../../../components/shared/editor/CodeEditor';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { formatXml, minifyXml } from './functions';
import { xmlReference } from './references';
import IoWorkbench from '../../../components/shared/layouts/IoWorkbench';
import { useTheme } from '../../../themes/ThemeContext';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';
import { useAppMessage } from '../../../components/shared/ui/AppMessage';

const text = {
	tool: 'XML 格式化工具',
	input: '输入',
	output: '输出',
	format: '格式化',
	minify: '压缩',
	valid: '有效 XML',
	invalid: '解析失败',
	pending: '待执行',
	dirty: '输入已变化，点击操作按钮更新输出。',
};

export default function XmlFormatter() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const [state, setState] = useToolStorage('bytekit:tool:xml:v1', {
		input: '<root>\n  <item name="hello">\n    <value>world</value>\n  </item>\n</root>',
		output: '',
		lastAction: 'format' as 'format' | 'minify',
		lastInput: '',
		error: '',
	});
	const { input, output, lastInput, lastAction = 'format' } = state;
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));

	function runAction(action: 'format' | 'minify') {
		const result = action === 'format' ? formatXml(input) : minifyXml(input);
		if (!result.ok) {
			message.error(result.error);
			return;
		}
		setState((current) => ({ ...current, lastAction: action, lastInput: input, output: result.output, error: '' }));
	}

	const isDirty = input !== (lastInput ?? '');
	const hasExecuted = !isDirty && lastInput !== '';
	const outputStatus = !hasExecuted ? 'neutral' : 'success';
	const outputStatusText = !hasExecuted ? text.pending : text.valid;

	useToolRefPanel('XML 参考', xmlReference);

	return (
		<>
			<IoWorkbench
				ariaLabel={text.tool}
				actions={(
					<>
						<Button variant={lastAction === 'format' ? 'primary' : 'secondary'} onClick={() => runAction('format')}>{text.format}</Button>
						<Button variant={lastAction === 'minify' ? 'primary' : 'secondary'} onClick={() => runAction('minify')}>{text.minify}</Button>
					</>
				)}
				input={<CodeEditor title={text.input} value={input} onChange={setInput} language="html" />}
				output={<CodeEditor title={text.output} value={output} language="html" status={outputStatus} statusText={outputStatusText} message={isDirty ? text.dirty : undefined} />}
			/>
		</>
	);
}
