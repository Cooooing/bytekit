import type { ToolDefinition } from '../../types';

export const definition: ToolDefinition = {
	id: 'mathjax',
	href: 'tools/text/mathjax',
	name: 'MathJax 公式渲染',
	shortName: 'MathJax',
	description: '实时渲染 LaTeX/TeX 数学公式，并导出 SVG 与 MathML。',
	category: 'text',
	keywords: ['mathjax', 'latex', 'tex', 'formula', 'mathml', 'svg', '数学公式'],
};
