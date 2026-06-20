export interface ColorValues {
	hex: string;
	rgb: { r: number; g: number; b: number };
	hsl: { h: number; s: number; l: number };
	rgba: string;
	hsla: string;
}

export type ColorResult =
	| { ok: true } & ColorValues
	| { ok: false; error: string };

export function parseColor(input: string): ColorResult {
	const trimmed = input.trim();
	if (!trimmed) return { ok: false, error: '请输入颜色值。' };

	// Try HEX
	if (/^#?[0-9a-fA-F]{3,8}$/.test(trimmed)) {
		return parseHex(trimmed.startsWith('#') ? trimmed : '#' + trimmed);
	}

	// Try rgb(r, g, b)
	const rgbMatch = trimmed.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
	if (rgbMatch) {
		return fromRgb(+rgbMatch[1], +rgbMatch[2], +rgbMatch[3]);
	}

	// Try hsl(h, s%, l%)
	const hslMatch = trimmed.match(/^hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/i);
	if (hslMatch) {
		return fromHsl(+hslMatch[1], +hslMatch[2], +hslMatch[3]);
	}

	return { ok: false, error: '无法解析颜色值。支持 HEX、RGB、HSL 格式。' };
}

function parseHex(hex: string): ColorResult {
	let h = hex.slice(1);
	if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
	if (h.length === 4) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
	if (h.length !== 6 && h.length !== 8) return { ok: false, error: '无效的 HEX 颜色值。' };

	const r = parseInt(h.slice(0, 2), 16);
	const g = parseInt(h.slice(2, 4), 16);
	const b = parseInt(h.slice(4, 6), 16);
	return fromRgb(r, g, b);
}

function fromRgb(r: number, g: number, b: number): ColorResult {
	if (r > 255 || g > 255 || b > 255) return { ok: false, error: 'RGB 值必须在 0-255 之间。' };
	const hsl = rgbToHsl(r, g, b);
	const hex = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
	return {
		ok: true,
		hex: hex.toUpperCase(),
		rgb: { r, g, b },
		hsl,
		rgba: `rgb(${r}, ${g}, ${b})`,
		hsla: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
	};
}

function fromHsl(h: number, s: number, l: number): ColorResult {
	if (h < 0 || h > 360) return { ok: false, error: 'HSL 色相必须在 0-360 之间。' };
	if (s < 0 || s > 100 || l < 0 || l > 100) return { ok: false, error: 'HSL 饱和度/亮度必须在 0-100 之间。' };
	const rgb = hslToRgb(h, s, l);
	return fromRgb(rgb.r, rgb.g, rgb.b);
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
	r /= 255; g /= 255; b /= 255;
	const max = Math.max(r, g, b), min = Math.min(r, g, b);
	const l = (max + min) / 2;
	if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	let h = 0;
	if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
	else if (max === g) h = ((b - r) / d + 2) / 6;
	else h = ((r - g) / d + 4) / 6;
	return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
	h /= 360; s /= 100; l /= 100;
	if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v }; }
	const hue2rgb = (p: number, q: number, t: number) => {
		if (t < 0) t += 1; if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	};
	const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	const p = 2 * l - q;
	return {
		r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
		g: Math.round(hue2rgb(p, q, h) * 255),
		b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
	};
}

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
	return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase();
}

export function generatePalette(hex: string): string[] | null {
	if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return null;
	const { h, s } = hexToHsl(hex);
	const lightnesses = [95, 80, 50, 35, 20];
	return lightnesses.map(l => hslToHex(h, s, l));
}
