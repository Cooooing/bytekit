export interface SvgInspection {
	width?: string;
	height?: string;
	viewBox?: string;
}

export type SvgInspectionResult =
	| { ok: true; inspection: SvgInspection }
	| { ok: false; error: string };

export function inspectSvg(source: string): SvgInspectionResult {
	const trimmed = source.trim();
	if (!trimmed) return { ok: false, error: '请输入 SVG 源码。' };
	const match = trimmed.match(/^<svg\b([^>]*)>/i);
	if (!match) return { ok: false, error: 'SVG 源码必须以 <svg> 根元素开始。' };
	if (!/<\/svg\s*>\s*$/i.test(trimmed)) return { ok: false, error: 'SVG 缺少结束标签 </svg>。' };

	const attributes = match[1];
	return {
		ok: true,
		inspection: {
			width: readAttribute(attributes, 'width'),
			height: readAttribute(attributes, 'height'),
			viewBox: readAttribute(attributes, 'viewBox'),
		},
	};
}

export function buildSvgPreviewDocument(source: string): string {
	return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{width:100%;height:100%;margin:0;overflow:hidden}body{background:transparent}svg{display:block;width:100%;height:100%;overflow:visible}</style></head><body>${source}</body></html>`;
}

function readAttribute(attributes: string, name: string): string | undefined {
	const match = attributes.match(new RegExp(`\\s${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
	return match?.[2];
}
