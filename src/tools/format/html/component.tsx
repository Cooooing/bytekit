import { useMemo } from 'react';
import CodeEditor from '../../../components/shared/editor/CodeEditor';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { formatHtml, minifyHtml } from './functions';
import { htmlFormatReference } from './references';
import IoWorkbench from '../../../components/shared/layouts/IoWorkbench';
import { useTheme } from '../../../themes/ThemeContext';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';

const text = {
	tool: 'HTML 格式化工具',
	input: '输入',
	output: '输出',
	format: '格式化',
	minify: '压缩',
	success: '格式化成功',
	fail: '格式化失败',
};

export default function HtmlFormatter() {
	const { Button } = useTheme();
	const [state, setState] = useToolStorage('bytekit:tool:html-format:v1', {
		input: '<!DOCTYPE html><html><head><title>Test</title></head><body><div class="container"><h1>Hello</h1><p>World</p></div></body></html>',
		output: '',
		lastAction: 'format' as 'format' | 'minify',
	});
	const { input, output, lastAction } = state;
	const setInput = (value: string) => setState((current) => ({ ...current, input: value }));

	function runAction(action: 'format' | 'minify') {
		const result = action === 'format' ? formatHtml(input) : minifyHtml(input);
		setState((current) => ({
			...current,
			lastAction: action,
			output: result.ok ? result.output : current.output,
		}));
	}

	const currentResult = useMemo(() =>
		lastAction === 'format' ? formatHtml(input) : minifyHtml(input),
		[input, lastAction]
	);

	useToolRefPanel('HTML 格式化参考', htmlFormatReference);

	return (
		<>
			<IoWorkbench
				ariaLabel={text.tool}
				actions={(
					<>
						<Button variant="primary" onClick={() => runAction('format')}>{text.format}</Button>
						<Button variant="secondary" onClick={() => runAction('minify')}>{text.minify}</Button>
					</>
				)}
				input={<CodeEditor title={text.input} value={input} onChange={setInput} language="html" />}
				output={<CodeEditor title={text.output} value={output} language="html" status={currentResult.ok ? 'success' : 'error'} statusText={currentResult.ok ? text.success : text.fail} error={currentResult.ok ? undefined : currentResult.error} />}
			/>
		</>
	);
}
