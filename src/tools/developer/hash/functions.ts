export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

export type HashResult =
	| { ok: true; hashes: Record<HashAlgorithm, string> }
	| { ok: false; error: string };

export async function computeHashes(input: string): Promise<HashResult> {
	if (!input) return { ok: false, error: '请输入要计算哈希的内容。' };

	const encoder = new TextEncoder();
	const data = encoder.encode(input);
	const algorithms: HashAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

	const entries = await Promise.all(algorithms.map(async (algo) => {
		const buffer = await crypto.subtle.digest(algo, data);
		const value = Array.from(new Uint8Array(buffer))
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');
		return [algo, value] as const;
	}));

	const hashes = Object.fromEntries(entries);
	return { ok: true, hashes: hashes as Record<HashAlgorithm, string> };
}
