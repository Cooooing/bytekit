export type ChecksumInputMode = 'text' | 'hex' | 'binary';

export type ChecksumAlgorithm =
	| 'crc16-modbus'
	| 'crc16-ccitt-false'
	| 'crc16-xmodem'
	| 'crc16-kermit'
	| 'crc16-ibm-arc'
	| 'crc16-usb'
	| 'crc16-custom'
	| 'crc32'
	| 'crc8'
	| 'crc8-maxim'
	| 'lrc'
	| 'bcc';

export interface Crc16CustomOptions {
	poly: string;
	init: string;
	xorout: string;
	refin: boolean;
	refout: boolean;
}

export interface ChecksumOptions {
	algorithm: ChecksumAlgorithm;
	inputMode: ChecksumInputMode;
	input: string;
	customCrc16?: Crc16CustomOptions;
}

export interface ChecksumResult {
	algorithm: ChecksumAlgorithm;
	label: string;
	width: number;
	byteLength: number;
	hex: string;
	decimal: string;
	binary: string;
	highFirst: string;
	lowFirst: string;
}

export type ChecksumCalculateResult =
	| { ok: true; result: ChecksumResult }
	| { ok: false; error: string };

interface CrcPreset {
	algorithm: ChecksumAlgorithm;
	label: string;
	width: number;
	poly: bigint;
	init: bigint;
	refin: boolean;
	refout: boolean;
	xorout: bigint;
}

const MAX_INPUT_BYTES = 100_000;

export const checksumAlgorithmLabels: Record<ChecksumAlgorithm, string> = {
	'crc16-modbus': 'CRC16/MODBUS',
	'crc16-ccitt-false': 'CRC16/CCITT-FALSE',
	'crc16-xmodem': 'CRC16/XMODEM',
	'crc16-kermit': 'CRC16/KERMIT',
	'crc16-ibm-arc': 'CRC16/IBM-ARC',
	'crc16-usb': 'CRC16/USB',
	'crc16-custom': 'CRC16 自定义',
	crc32: 'CRC32',
	crc8: 'CRC8',
	'crc8-maxim': 'CRC8/MAXIM',
	lrc: 'LRC',
	bcc: 'BCC/XOR',
};

const crcPresets: Record<Exclude<ChecksumAlgorithm, 'crc16-custom' | 'lrc' | 'bcc'>, CrcPreset> = {
	'crc16-modbus': {
		algorithm: 'crc16-modbus',
		label: checksumAlgorithmLabels['crc16-modbus'],
		width: 16,
		poly: 0x8005n,
		init: 0xffffn,
		refin: true,
		refout: true,
		xorout: 0x0000n,
	},
	'crc16-ccitt-false': {
		algorithm: 'crc16-ccitt-false',
		label: checksumAlgorithmLabels['crc16-ccitt-false'],
		width: 16,
		poly: 0x1021n,
		init: 0xffffn,
		refin: false,
		refout: false,
		xorout: 0x0000n,
	},
	'crc16-xmodem': {
		algorithm: 'crc16-xmodem',
		label: checksumAlgorithmLabels['crc16-xmodem'],
		width: 16,
		poly: 0x1021n,
		init: 0x0000n,
		refin: false,
		refout: false,
		xorout: 0x0000n,
	},
	'crc16-kermit': {
		algorithm: 'crc16-kermit',
		label: checksumAlgorithmLabels['crc16-kermit'],
		width: 16,
		poly: 0x1021n,
		init: 0x0000n,
		refin: true,
		refout: true,
		xorout: 0x0000n,
	},
	'crc16-ibm-arc': {
		algorithm: 'crc16-ibm-arc',
		label: checksumAlgorithmLabels['crc16-ibm-arc'],
		width: 16,
		poly: 0x8005n,
		init: 0x0000n,
		refin: true,
		refout: true,
		xorout: 0x0000n,
	},
	'crc16-usb': {
		algorithm: 'crc16-usb',
		label: checksumAlgorithmLabels['crc16-usb'],
		width: 16,
		poly: 0x8005n,
		init: 0xffffn,
		refin: true,
		refout: true,
		xorout: 0xffffn,
	},
	crc32: {
		algorithm: 'crc32',
		label: checksumAlgorithmLabels.crc32,
		width: 32,
		poly: 0x04c11db7n,
		init: 0xffffffffn,
		refin: true,
		refout: true,
		xorout: 0xffffffffn,
	},
	crc8: {
		algorithm: 'crc8',
		label: checksumAlgorithmLabels.crc8,
		width: 8,
		poly: 0x07n,
		init: 0x00n,
		refin: false,
		refout: false,
		xorout: 0x00n,
	},
	'crc8-maxim': {
		algorithm: 'crc8-maxim',
		label: checksumAlgorithmLabels['crc8-maxim'],
		width: 8,
		poly: 0x31n,
		init: 0x00n,
		refin: true,
		refout: true,
		xorout: 0x00n,
	},
};

export function calculateChecksum(options: ChecksumOptions): ChecksumCalculateResult {
	const parsed = parseInputBytes(options.inputMode, options.input);
	if (!parsed.ok) return parsed;

	const bytes = parsed.bytes;
	if (options.algorithm === 'lrc') {
		return toResult(options.algorithm, checksumAlgorithmLabels.lrc, calculateLrc(bytes), 8, bytes.length);
	}
	if (options.algorithm === 'bcc') {
		return toResult(options.algorithm, checksumAlgorithmLabels.bcc, calculateBcc(bytes), 8, bytes.length);
	}

	const preset = options.algorithm === 'crc16-custom'
		? parseCustomCrc16(options.customCrc16)
		: { ok: true as const, preset: crcPresets[options.algorithm] };
	if (!preset.ok) return { ok: false, error: preset.error };

	const value = calculateCrc(bytes, preset.preset);
	return toResult(options.algorithm, preset.preset.label, value, preset.preset.width, bytes.length);
}

function parseInputBytes(inputMode: ChecksumInputMode, input: string): { ok: true; bytes: Uint8Array } | { ok: false; error: string } {
	const raw = input.trim();
	if (!raw) return { ok: false, error: '请输入需要计算校验码的内容。' };

	if (inputMode === 'text') {
		const bytes = new TextEncoder().encode(input);
		return validateByteLength(bytes);
	}
	if (inputMode === 'hex') return parseHexBytes(raw);
	return parseBinaryBytes(raw);
}

function parseHexBytes(input: string): { ok: true; bytes: Uint8Array } | { ok: false; error: string } {
	const normalized = input.replace(/0x/gi, '').replace(/[\s,;:_-]/g, '');
	if (!normalized) return { ok: false, error: '请输入 Hex 字节。' };
	if (!/^[0-9a-f]+$/i.test(normalized)) return { ok: false, error: 'Hex 输入只能包含 0-9 和 A-F。' };
	if (normalized.length % 2 !== 0) return { ok: false, error: 'Hex 输入必须是完整字节，字符数量应为偶数。' };

	const bytes = new Uint8Array(normalized.length / 2);
	for (let i = 0; i < normalized.length; i += 2) {
		bytes[i / 2] = Number.parseInt(normalized.slice(i, i + 2), 16);
	}
	return validateByteLength(bytes);
}

function parseBinaryBytes(input: string): { ok: true; bytes: Uint8Array } | { ok: false; error: string } {
	const normalized = input.replace(/0b/gi, '').replace(/[\s,;:_-]/g, '');
	if (!normalized) return { ok: false, error: '请输入二进制字节。' };
	if (!/^[01]+$/.test(normalized)) return { ok: false, error: '二进制输入只能包含 0 和 1。' };
	if (normalized.length % 8 !== 0) return { ok: false, error: '二进制输入必须按 8 位组成完整字节。' };

	const bytes = new Uint8Array(normalized.length / 8);
	for (let i = 0; i < normalized.length; i += 8) {
		bytes[i / 8] = Number.parseInt(normalized.slice(i, i + 8), 2);
	}
	return validateByteLength(bytes);
}

function validateByteLength(bytes: Uint8Array): { ok: true; bytes: Uint8Array } | { ok: false; error: string } {
	if (bytes.length === 0) return { ok: false, error: '请输入至少 1 个字节。' };
	if (bytes.length > MAX_INPUT_BYTES) return { ok: false, error: `最多支持 ${MAX_INPUT_BYTES} 字节。` };
	return { ok: true, bytes };
}

function parseCustomCrc16(options: Crc16CustomOptions | undefined): { ok: true; preset: CrcPreset } | { ok: false; error: string } {
	if (!options) return { ok: false, error: '缺少 CRC16 自定义参数。' };
	const poly = parseHexParameter(options.poly, '多项式');
	if (!poly.ok) return poly;
	const init = parseHexParameter(options.init, '初始值');
	if (!init.ok) return init;
	const xorout = parseHexParameter(options.xorout, '结果异或');
	if (!xorout.ok) return xorout;
	const mask = 0xffffn;
	if (poly.value > mask) return { ok: false, error: 'CRC16 多项式不能超过 0xFFFF。' };
	if (init.value > mask) return { ok: false, error: 'CRC16 初始值不能超过 0xFFFF。' };
	if (xorout.value > mask) return { ok: false, error: 'CRC16 结果异或不能超过 0xFFFF。' };

	return {
		ok: true,
		preset: {
			algorithm: 'crc16-custom',
			label: checksumAlgorithmLabels['crc16-custom'],
			width: 16,
			poly: poly.value,
			init: init.value,
			refin: options.refin,
			refout: options.refout,
			xorout: xorout.value,
		},
	};
}

function parseHexParameter(value: string, label: string): { ok: true; value: bigint } | { ok: false; error: string } {
	const normalized = value.trim().replace(/^0x/i, '');
	if (!normalized) return { ok: false, error: `请输入${label}。` };
	if (!/^[0-9a-f]+$/i.test(normalized)) return { ok: false, error: `${label}只能使用 Hex 数值。` };
	return { ok: true, value: BigInt(`0x${normalized}`) };
}

function calculateCrc(bytes: Uint8Array, preset: CrcPreset): bigint {
	const width = BigInt(preset.width);
	const mask = (1n << width) - 1n;
	const topBit = 1n << (width - 1n);
	const reflectedPoly = reflectBits(preset.poly, preset.width);
	let crc = preset.init & mask;

	for (const byte of bytes) {
		if (preset.refin) {
			crc ^= BigInt(byte);
			for (let bit = 0; bit < 8; bit += 1) {
				crc = (crc & 1n) === 1n ? (crc >> 1n) ^ reflectedPoly : crc >> 1n;
				crc &= mask;
			}
		} else {
			crc ^= BigInt(byte) << BigInt(preset.width - 8);
			for (let bit = 0; bit < 8; bit += 1) {
				crc = (crc & topBit) !== 0n ? (crc << 1n) ^ preset.poly : crc << 1n;
				crc &= mask;
			}
		}
	}

	if (preset.refin !== preset.refout) crc = reflectBits(crc, preset.width);
	return (crc ^ preset.xorout) & mask;
}

function calculateLrc(bytes: Uint8Array): bigint {
	let sum = 0;
	for (const byte of bytes) sum = (sum + byte) & 0xff;
	return BigInt(((-sum) & 0xff) >>> 0);
}

function calculateBcc(bytes: Uint8Array): bigint {
	let value = 0;
	for (const byte of bytes) value ^= byte;
	return BigInt(value);
}

function reflectBits(value: bigint, width: number): bigint {
	let reflected = 0n;
	for (let i = 0; i < width; i += 1) {
		if ((value & (1n << BigInt(i))) !== 0n) {
			reflected |= 1n << BigInt(width - 1 - i);
		}
	}
	return reflected;
}

function toResult(algorithm: ChecksumAlgorithm, label: string, value: bigint, width: number, byteLength: number): ChecksumCalculateResult {
	const hexDigits = Math.ceil(width / 4);
	const hexValue = value.toString(16).toUpperCase().padStart(hexDigits, '0');
	const binaryValue = value.toString(2).padStart(width, '0');
	const bytes = splitHexBytes(hexValue);

	return {
		ok: true,
		result: {
			algorithm,
			label,
			width,
			byteLength,
			hex: `0x${hexValue}`,
			decimal: value.toString(10),
			binary: `0b${binaryValue}`,
			highFirst: bytes.join(' '),
			lowFirst: [...bytes].reverse().join(' '),
		},
	};
}

function splitHexBytes(hexValue: string): string[] {
	const padded = hexValue.length % 2 === 0 ? hexValue : `0${hexValue}`;
	const bytes: string[] = [];
	for (let i = 0; i < padded.length; i += 2) {
		bytes.push(padded.slice(i, i + 2));
	}
	return bytes;
}
