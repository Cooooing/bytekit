function hexToHsl(hex: string): { h: number; s: number; l: number } {
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;
	const max = Math.max(r, g, b), min = Math.min(r, g, b);
	const l = (max + min) / 2;
	let h = 0, s = 0;
	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
		else if (max === g) h = ((b - r) / d + 2) / 6;
		else h = ((r - g) / d + 4) / 6;
	}
	return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
	s /= 100;
	l /= 100;
	const a = s * Math.min(l, 1 - l);
	const f = (n: number) => {
		const k = (n + h / 30) % 12;
		return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
	};
	const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
	return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

export function generatePalette(hex: string): { ok: true; colors: string[] } | { ok: false; error: string } {
	if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return { ok: false, error: '请输入有效的 HEX 颜色值（如 #3B82F6）' };
	const { h, s } = hexToHsl(hex);
	const lightnesses = [95, 80, 50, 35, 20];
	const colors = lightnesses.map(l => hslToHex(h, s, l));
	return { ok: true, colors };
}
