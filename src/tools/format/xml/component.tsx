import { useMemo } from 'react';
import CodeEditor from '../../../components/shared/editor/CodeEditor';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { formatXml, minifyXml, validateXml } from './functions';
import { xmlReference } from './references';
import IoWorkbench from '../../../components/shared/layouts/IoWorkbench';
import { useTheme } from '../../../themes/ThemeContext';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';

const text = {
	tool: 'XML 格式化工具',
	input: '输入',
	output: '输出',
	format: '格式化',
	minify: '压缩',
	validate: '校验',
	valid: '有效 XML',
	invalid: '解析失败',
};

export default function XmlFormatter() {
	const { Button } = useTheme();
	const [state, setState] = useToolStorage('bytekit:tool:xml:v1', {
		input: '<root>\n  <item name="hello">\n    <value>world</value>\n  </item>\n</root>',
		output: '',
	});
	const { input, output } = state;
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));

	function runAction(action: 'format' | 'minify' | 'validate') {
		if (action === 'validate') {
			const result = validateXml(input);
			if (result.ok) {
				setState((current) => ({ ...current, output: input }));
			}
			return;
		}
		const result = action === 'format' ? formatXml(input) : minifyXml(input);
		if (result.ok) {
			setState((current) => ({ ...current, output: result.output }));
		}
	}

	const formatResult = useMemo(() => {
		if (!input) return { ok: false as const, error: '请输入 XML 数据' };
		const v = validateXml(input);
		return v;
	}, [input]);

	useToolRefPanel('XML 参考', xmlReference);

	return (
		<>
			<IoWorkbench
				ariaLabel={text.tool}
				actions={(
					<>
						<Button variant="primary" onClick={() => runAction('format')}>{text.format}</Button>
						<Button variant="secondary" onClick={() => runAction('minify')}>{text.minify}</Button>
						<Button variant="secondary" onClick={() => runAction('validate')}>{text.validate}</Button>
					</>
				)}
				input={<CodeEditor title={text.input} value={input} onChange={setInput} language="html" />}
				output={<CodeEditor title={text.output} value={output} language="html" status={formatResult.ok ? 'success' : 'error'} statusText={formatResult.ok ? text.valid : text.invalid} error={formatResult.ok ? undefined : formatResult.error} />}
			/>
		</>
	);
}
