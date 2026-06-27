const DEFAULT_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateNanoId(length: number = 21, alphabet: string = DEFAULT_ALPHABET): string {
	let id = '';
	const chars = Array.from(alphabet);
	if (chars.length === 0) return id;
	const randomValues = new Uint32Array(length);
	crypto.getRandomValues(randomValues);
	for (let i = 0; i < length; i++) {
		id += chars[randomValues[i] % chars.length];
	}
	return id;
}

export function generateBatch(count: number, length: number = 21, alphabet: string = DEFAULT_ALPHABET): string[] {
	return Array.from({ length: count }, () => generateNanoId(length, alphabet));
}
