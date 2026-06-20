export type CssUnit = 'px' | 'rem' | 'em' | 'vw' | 'vh' | 'percent';

const UNIT_LABELS: Record<CssUnit, string> = {
	px: '像素 (px)',
	rem: '根字体 (rem)',
	em: '父字体 (em)',
	vw: '视窗宽度 (vw)',
	vh: '视窗高度 (vh)',
	percent: '百分比 (%)',
};

export { UNIT_LABELS };

export function convertCssUnit(value: number, from: CssUnit, to: CssUnit, baseFontSize: number = 16, viewportWidth: number = 1920, viewportHeight: number = 1080): number {
	// Convert to px first
	let px: number;
	switch (from) {
		case 'px': px = value; break;
		case 'rem': px = value * baseFontSize; break;
		case 'em': px = value * baseFontSize; break;
		case 'vw': px = (value / 100) * viewportWidth; break;
		case 'vh': px = (value / 100) * viewportHeight; break;
		case 'percent': px = (value / 100) * viewportWidth; break;
		default: px = value;
	}
	// Convert from px to target
	switch (to) {
		case 'px': return Math.round(px * 100) / 100;
		case 'rem': return Math.round((px / baseFontSize) * 100) / 100;
		case 'em': return Math.round((px / baseFontSize) * 100) / 100;
		case 'vw': return Math.round((px / viewportWidth) * 10000) / 100;
		case 'vh': return Math.round((px / viewportHeight) * 10000) / 100;
		case 'percent': return Math.round((px / viewportWidth) * 10000) / 100;
		default: return px;
	}
}

export function convertAll(value: number, from: CssUnit, baseFontSize: number, viewportWidth: number, viewportHeight: number): Array<{ unit: CssUnit; label: string; value: number }> {
	const units: CssUnit[] = ['px', 'rem', 'em', 'vw', 'vh', 'percent'];
	return units.map((unit) => ({
		unit,
		label: UNIT_LABELS[unit],
		value: convertCssUnit(value, from, unit, baseFontSize, viewportWidth, viewportHeight),
	}));
}
