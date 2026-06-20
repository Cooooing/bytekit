const DEFAULT_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateNanoId(length: number = 21, alphabet: string = DEFAULT_ALPHABET): string {
	let id = '';
	const bytes = new Uint8Array(length);
	crypto.getRandomValues(bytes);
	for (let i = 0; i < length; i++) {
		id += alphabet[bytes[i] % alphabet.length];
	}
	return id;
}

export function generateBatch(count: number, length: number = 21, alphabet: string = DEFAULT_ALPHABET): string[] {
	return Array.from({ length: count }, () => generateNanoId(length, alphabet));
}
