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

	if (!Number.isInteger(options.length) || options.length < 4 || options.length > 128) {
		return { ok: false, error: '密码长度必须在 4 到 128 之间。' };
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
