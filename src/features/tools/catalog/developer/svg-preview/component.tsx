import { Download, Minus, Plus, Upload } from 'lucide-react';
import { useMemo, useRef } from 'react';
import CodeEditor from '@features/tools/shared/CodeEditor';
import IoWorkbench from '@features/tools/shared/IoWorkbench';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { useTheme } from '@themes/ThemeContext';
import { buildSvgPreviewDocument, inspectSvg } from './functions';
import { svgPreviewReference } from './references';

type CanvasBackground = 'transparent' | 'light' | 'dark';

interface SvgPreviewState {
	source: string;
	zoom: number;
	background: CanvasBackground;
}

const defaultState: SvgPreviewState = {
	source: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160" role="img" aria-label="Bytekit SVG preview">
  <rect width="240" height="160" rx="16" fill="#0f62fe" />
  <circle cx="72" cy="80" r="38" fill="#9ef0f0" />
  <path d="M126 104V56h12l18 27 18-27h12v48h-12V76l-18 27-18-27v28z" fill="white" />
</svg>`,
	zoom: 1,
	background: 'transparent',
};

export default function SvgPreviewTool() {
	const { Button } = useTheme();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [state, setState] = useToolStorage<SvgPreviewState>('bytekit:tool:svg-preview:v1', defaultState);
	const inspection = useMemo(() => inspectSvg(state.source), [state.source]);
	const srcDoc = useMemo(() => inspection.ok ? buildSvgPreviewDocument(state.source) : '', [inspection.ok, state.source]);

	useToolRefPanel('SVG 参考', svgPreviewReference);

	function update(partial: Partial<SvgPreviewState>) {
		setState((current) => ({ ...current, ...partial }));
	}

	function downloadSvg() {
		if (!inspection.ok) return;
		const url = URL.createObjectURL(new Blob([state.source], { type: 'image/svg+xml' }));
		const link = document.createElement('a');
		link.href = url;
		link.download = 'bytekit.svg';
		link.click();
		URL.revokeObjectURL(url);
	}

	async function uploadSvg(file?: File) {
		if (!file) return;
		if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') return;
		update({ source: await file.text() });
	}

	const status = inspection.ok ? '已渲染' : '等待有效 SVG';
	const metadata = inspection.ok ? [inspection.inspection.viewBox && `viewBox ${inspection.inspection.viewBox}`, inspection.inspection.width && `宽 ${inspection.inspection.width}`, inspection.inspection.height && `高 ${inspection.inspection.height}`].filter(Boolean).join(' · ') : undefined;

	return (
		<IoWorkbench
			ariaLabel="SVG 预览工具"
			actions={
				<div className="svg-preview-actions">
					<div className="svg-preview-actions__group" aria-label="预览缩放">
						<Button variant="secondary" size="sm" disabled={state.zoom <= 0.4} onClick={() => update({ zoom: Math.max(0.4, state.zoom - 0.1) })}><Minus size={15} /></Button>
						<span>{Math.round(state.zoom * 100)}%</span>
						<Button variant="secondary" size="sm" disabled={state.zoom >= 2.5} onClick={() => update({ zoom: Math.min(2.5, state.zoom + 0.1) })}><Plus size={15} /></Button>
					</div>
					<select className="svg-preview-background" value={state.background} onChange={(event) => update({ background: event.target.value as CanvasBackground })} aria-label="预览背景">
						<option value="transparent">透明网格</option>
						<option value="light">浅色背景</option>
						<option value="dark">深色背景</option>
					</select>
					<input ref={fileInputRef} className="sr-only" type="file" accept="image/svg+xml,.svg" onChange={(event) => { void uploadSvg(event.target.files?.[0]); event.currentTarget.value = ''; }} />
					<Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}><Upload size={15} /> 导入</Button>
					<Button variant="ghost" size="sm" disabled={!inspection.ok} onClick={downloadSvg}><Download size={15} /> 下载</Button>
				</div>
			}
			input={<CodeEditor title="SVG 源码" value={state.source} onChange={(source) => update({ source })} language="html" status={inspection.ok ? 'success' : 'error'} statusText={status} error={inspection.ok ? undefined : inspection.error} />}
			output={
				<div className="svg-preview" aria-live="polite">
					<header className="svg-preview__toolbar"><span className="code-editor__title">实时预览</span><span className="code-editor__meta">{metadata ?? status}</span></header>
					<div className={`svg-preview__canvas svg-preview__canvas--${state.background}`}>
						{inspection.ok ? <iframe title="SVG 预览" sandbox="" srcDoc={srcDoc} style={{ transform: `scale(${state.zoom})` }} /> : <div className="state-box state-box--error">{inspection.error}</div>}
					</div>
				</div>
			}
		/>
	);
}
