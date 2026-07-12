import { describe, expect, it } from 'vitest';
import { renderTexFormula } from './functions';

describe('renderTexFormula', () => {
	it('生成分式的 SVG 和 MathML', async () => {
		const result = await renderTexFormula('\\frac{a}{b}');
		expect(result.svg).toContain('<svg');
		expect(result.mathml).toContain('<mfrac>');
	});

	it('支持矩阵和自定义宏', async () => {
		const result = await renderTexFormula('\\newcommand{\\RR}{\\mathbb{R}}\\begin{bmatrix} \\RR & 1 \\\\ 0 & 1 \\end{bmatrix}');
		expect(result.svg).toContain('<svg');
		expect(result.mathml).toContain('<mtable');
	});

	it('空输入返回错误', async () => {
		await expect(renderTexFormula('')).rejects.toThrow('请输入');
	});

	it('非法 TeX 返回错误', async () => {
		await expect(renderTexFormula('\\frac{1}')).rejects.toThrow();
	});
});
