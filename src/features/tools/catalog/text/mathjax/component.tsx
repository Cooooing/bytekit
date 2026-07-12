import { useEffect, useMemo, useState } from 'react';
import CodeEditor from '@features/tools/shared/CodeEditor';
import IoWorkbench from '@features/tools/shared/IoWorkbench';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue';
import { useAppMessage, useMessageOnError } from '@shared/ui/AppMessage';
import { useTheme } from '@themes/ThemeContext';
import { renderTexFormula, type RenderedFormula } from './functions';
import { mathjaxReference } from './references';

interface MathJaxState {
	input: string;
}

const defaultState: MathJaxState = {
	input: 'R_{\\mu\\nu} - \\frac{1}{2}R g_{\\mu\\nu} + \\Lambda g_{\\mu\\nu}\n= \\frac{8\\pi G}{c^4} T_{\\mu\\nu}',
};

export default function MathJaxTool() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const [state, setState] = useToolStorage<MathJaxState>('bytekit:tool:mathjax:v2', defaultState);
	const renderInput = useDebouncedValue(state.input, 250);
	const [rendered, setRendered] = useState<RenderedFormula | null>(null);
	const [renderError, setRenderError] = useState<string | undefined>();
	const [isRendering, setIsRendering] = useState(false);
	const isEmpty = renderInput.trim() === '';

	useToolRefPanel('MathJax 参考', mathjaxReference);
	useMessageOnError(renderError);

	useEffect(() => {
		if (isEmpty) {
			setRendered(null);
			setRenderError(undefined);
			setIsRendering(false);
			return;
		}

		let cancelled = false;
		setIsRendering(true);
		renderTexFormula(renderInput)
			.then((next) => {
				if (cancelled) return;
				setRendered(next);
				setRenderError(undefined);
			})
			.catch((error) => {
				if (!cancelled) setRenderError(error instanceof Error ? `公式渲染失败：${error.message}` : '公式渲染失败。');
			})
			.finally(() => {
				if (!cancelled) setIsRendering(false);
			});

		return () => { cancelled = true; };
	}, [isEmpty, renderInput]);

	const statusText = useMemo(() => {
		if (isEmpty) return '等待输入';
		if (isRendering) return '更新中';
		return rendered ? '已渲染' : '等待渲染';
	}, [isEmpty, isRendering, rendered]);

	async function copyOutput(value: string, successText: string) {
		try {
			await navigator.clipboard.writeText(value);
			message.success(successText);
		} catch {
			message.error('复制失败，请检查浏览器剪贴板权限。');
		}
	}

	function downloadSvg() {
		if (!rendered) return;
		const url = URL.createObjectURL(new Blob([rendered.svg], { type: 'image/svg+xml' }));
		const link = document.createElement('a');
		link.href = url;
		link.download = 'bytekit-formula.svg';
		link.click();
		URL.revokeObjectURL(url);
	}

	return (
		<IoWorkbench
			ariaLabel="MathJax 公式渲染"
			actions={
				<div className="mathjax-actions">
					<div className="mathjax-actions__commands">
						<Button variant="secondary" size="sm" disabled={!rendered} onClick={() => rendered && void copyOutput(rendered.svg, 'SVG 已复制')}>复制 SVG</Button>
						<Button variant="secondary" size="sm" disabled={!rendered} onClick={() => rendered && void copyOutput(rendered.mathml, 'MathML 已复制')}>复制 MathML</Button>
						<Button variant="ghost" size="sm" disabled={!rendered} onClick={downloadSvg}>下载 SVG</Button>
					</div>
				</div>
			}
			input={<CodeEditor title="LaTeX / TeX" value={state.input} onChange={(input) => setState((current) => ({ ...current, input }))} language="text" status={isEmpty ? 'neutral' : renderError ? 'error' : rendered ? 'success' : 'neutral'} statusText={statusText} />}
			output={
				<div className="mathjax-preview" aria-live="polite">
					<div className="mathjax-preview__toolbar">
						<span className="code-editor__title">公式预览</span>
						<span className="code-editor__meta">{statusText}</span>
					</div>
					<div className="mathjax-preview__formula mathjax-preview__formula--block">
						{rendered ? <div className="mathjax-preview__svg" dangerouslySetInnerHTML={{ __html: rendered.svg }} /> : <div className="state-box">输入公式后显示预览。</div>}
					</div>
				</div>
			}
		/>
	);
}
