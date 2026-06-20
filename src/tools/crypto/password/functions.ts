export type PasswordMode = 'random' | 'pin';

export interface PasswordOptions {
	mode?: PasswordMode;
	length: number;
	lowercase: boolean;
	uppercase: boolean;
	numbers: boolean;
	symbols: boolean;
}

export type PasswordResult =
	| { ok: true; password: string }
	| { ok: false; error: string };

export const RANDOM_PASSWORD_MAX_LENGTH = 128;
export const PIN_MAX_LENGTH = 12;

const CHARSETS = {
	lowercase: 'abcdefghijklmnopqrstuvwxyz',
	uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	numbers: '0123456789',
	symbols: '!@#$%^&*()_+-=[]{};:,.<>?',
} as const;

function randomIndex(max: number): number {
	const values = new Uint32Array(1);
	crypto.getRandomValues(values);
	return values[0] % max;
}

function shuffle(chars: string[]): string[] {
	for (let index = chars.length - 1; index > 0; index -= 1) {
		const next = randomIndex(index + 1);
		[chars[index], chars[next]] = [chars[next], chars[index]];
	}

	return chars;
}

export function generatePassword(options: PasswordOptions): PasswordResult {
	const mode = options.mode ?? 'random';
	const maxLength = mode === 'pin' ? PIN_MAX_LENGTH : RANDOM_PASSWORD_MAX_LENGTH;

	if (!Number.isInteger(options.length) || options.length < 4 || options.length > maxLength) {
		return { ok: false, error: `密码长度必须在 4 到 ${maxLength} 之间。` };
	}

	if (mode === 'pin') {
		const chars: string[] = [];

		while (chars.length < options.length) {
			chars.push(CHARSETS.numbers[randomIndex(CHARSETS.numbers.length)]);
		}

		return { ok: true, password: chars.join('') };
	}

	const enabledSets = [
		options.lowercase && CHARSETS.lowercase,
		options.uppercase && CHARSETS.uppercase,
		options.numbers && CHARSETS.numbers,
		options.symbols && CHARSETS.symbols,
	].filter(Boolean) as string[];

	if (enabledSets.length === 0) {
		return { ok: false, error: '至少选择一种字符集。' };
	}

	if (options.length < enabledSets.length) {
		return { ok: false, error: '密码长度不能小于字符集数量。' };
	}

	const pool = enabledSets.join('');
	const chars = enabledSets.map((set) => set[randomIndex(set.length)]);

	while (chars.length < options.length) {
		chars.push(pool[randomIndex(pool.length)]);
	}

	return { ok: true, password: shuffle(chars).join('') };
}

const POOL_SIZES = { lowercase: 26, uppercase: 26, numbers: 10, symbols: 24 } as const;

export interface EntropyResult {
	bits: number;
	poolSize: number;
	strength: 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong';
	strengthLabel: string;
}

const STRENGTH_LABELS: Record<EntropyResult['strength'], string> = {
	'very-weak': '极弱',
	weak: '弱',
	fair: '一般',
	strong: '强',
	'very-strong': '极强',
};

export function computeEntropy(options: PasswordOptions): EntropyResult {
	const mode = options.mode ?? 'random';
	const poolSize = mode === 'pin'
		? POOL_SIZES.numbers
		: (options.lowercase ? POOL_SIZES.lowercase : 0)
			+ (options.uppercase ? POOL_SIZES.uppercase : 0)
			+ (options.numbers ? POOL_SIZES.numbers : 0)
			+ (options.symbols ? POOL_SIZES.symbols : 0);

	const bits = poolSize > 0 ? Math.round(options.length * Math.log2(poolSize) * 10) / 10 : 0;

	let strength: EntropyResult['strength'];
	if (bits < 28) strength = 'very-weak';
	else if (bits < 36) strength = 'weak';
	else if (bits < 60) strength = 'fair';
	else if (bits < 128) strength = 'strong';
	else strength = 'very-strong';

	return { bits, poolSize, strength, strengthLabel: STRENGTH_LABELS[strength] };
}
