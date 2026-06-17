import { useMemo, useEffect } from 'react';
import CodeEditor from '../../../components/shared/editor/CodeEditor';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { minifyCss, beautifyCss } from './functions';
import { cssReference } from './references';
import IoWorkbench from '../../../components/shared/layouts/IoWorkbench';
import { useTheme } from '../../../themes/ThemeContext';
import { useRefPanel } from '../../../components/shared/layouts/RefPanelContext';

const text = {
	tool: 'CSS 压缩/美化',
	input: '输入',
	output: '输出',
	minify: '压缩',
	beautify: '美化',
	success: '完成',
	fail: '失败',
};

export default function CssMinify() {
	const { Button } = useTheme();
	const { setRefContent } = useRefPanel();
	const [state, setState] = useToolStorage('bytekit:tool:css:v1', {
		input: 'body {\n  margin: 0;\n  padding: 0;\n  font-family: sans-serif;\n}\n\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 16px;\n}',
		output: '',
		lastAction: 'minify' as 'minify' | 'beautify',
	});
	const { input, output, lastAction } = state;
	const setInput = (v: string) => setState((c) => ({ ...c, input: v }));

	function runAction(action: 'minify' | 'beautify') {
		const result = action === 'minify' ? minifyCss(input) : beautifyCss(input);
		setState((c) => ({ ...c, lastAction: action, output: result.ok ? result.output : c.output }));
	}

	const currentResult = useMemo(() =>
		lastAction === 'minify' ? minifyCss(input) : beautifyCss(input),
		[input, lastAction]
	);

	useEffect(() => {
		setRefContent({ title: 'CSS 参考', sections: cssReference });
		return () => setRefContent(null);
	}, [setRefContent]);

	return (
		<>
			<IoWorkbench
				ariaLabel={text.tool}
				actions={(
					<>
						<Button variant="primary" onClick={() => runAction('minify')}>{text.minify}</Button>
						<Button variant="secondary" onClick={() => runAction('beautify')}>{text.beautify}</Button>
					</>
				)}
				input={<CodeEditor title={text.input} value={input} onChange={setInput} language="css" />}
				output={<CodeEditor title={text.output} value={output} language="css" status={currentResult.ok ? 'success' : 'error'} statusText={currentResult.ok ? text.success : text.fail} error={currentResult.ok ? undefined : currentResult.error} />}
			/>
		</>
	);
}
