import {
	createCRC32,
	createSHA1,
	createSHA256,
	createSHA384,
	createSHA512,
	type IHasher,
} from 'hash-wasm';

export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' | 'CRC32';

export const HASH_ALGORITHMS: HashAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512', 'CRC32'];
export const DEFAULT_HASH_ALGORITHMS: HashAlgorithm[] = ['SHA-256'];
export const FILE_HASH_CHUNK_SIZE = 4 * 1024 * 1024;

export type HashResult =
	| { ok: true; hashes: Record<HashAlgorithm, string> }
	| { ok: false; error: string };

export type HashCompareState = 'idle' | 'matched' | 'mismatched' | 'unknown-algorithm';

export interface HashCompareResult {
	status: HashCompareState;
	algorithm?: HashAlgorithm;
	value: string;
}

export async function computeHashes(input: string, algorithms: HashAlgorithm[] = HASH_ALGORITHMS): Promise<HashResult> {
	if (!input) return { ok: false, error: '请输入要计算哈希的内容。' };
	return computeByteHashes(new TextEncoder().encode(input), algorithms);
}

export async function computeByteHashes(data: Uint8Array, algorithms: HashAlgorithm[] = HASH_ALGORITHMS): Promise<HashResult> {
	if (algorithms.length === 0) return { ok: false, error: '请至少选择一种算法。' };

	const hashers = await createHashers(algorithms);
	hashers.forEach(({ hasher }) => hasher.update(data));
	const entries = hashers.map(({ algorithm, hasher }) => [algorithm, hasher.digest('hex')] as const);

	return { ok: true, hashes: Object.fromEntries(entries) as Record<HashAlgorithm, string> };
}

export async function createHashers(algorithms: HashAlgorithm[]): Promise<Array<{ algorithm: HashAlgorithm; hasher: IHasher }>> {
	return Promise.all(algorithms.map(async (algorithm) => {
		const hasher = await createHasher(algorithm);
		hasher.init();
		return { algorithm, hasher };
	}));
}

export function compareExpectedHash(expected: string, hashes: Partial<Record<HashAlgorithm, string>>): HashCompareResult {
	const parsed = parseExpectedHash(expected);
	if (!parsed.value) return { status: 'idle', value: '' };
	if (parsed.algorithm && !hashes[parsed.algorithm]) {
		return { status: 'unknown-algorithm', algorithm: parsed.algorithm, value: parsed.value };
	}

	if (parsed.algorithm) {
		return {
			status: normalizeHashValue(hashes[parsed.algorithm] ?? '') === parsed.value ? 'matched' : 'mismatched',
			algorithm: parsed.algorithm,
			value: parsed.value,
		};
	}

	const matched = HASH_ALGORITHMS.some((algorithm) => hashes[algorithm] && normalizeHashValue(hashes[algorithm] ?? '') === parsed.value);
	return { status: matched ? 'matched' : 'mismatched', value: parsed.value };
}

export function parseExpectedHash(value: string): { algorithm?: HashAlgorithm; value: string } {
	const trimmed = value.trim();
	if (!trimmed) return { value: '' };

	const prefixMatch = trimmed.match(/^\s*(sha[\s_-]?(?:1|256|384|512)|crc[\s_-]?32)\s*[:= ]\s*(.+)$/i);
	const algorithm = prefixMatch ? normalizeAlgorithmName(prefixMatch[1]) : inferAlgorithmFromHash(trimmed);
	const hashValue = normalizeHashValue(prefixMatch ? prefixMatch[2] : trimmed);
	return { algorithm, value: hashValue };
}

export function normalizeHashValue(value: string) {
	return value.toLowerCase().replace(/\s+/g, '');
}

function createHasher(algorithm: HashAlgorithm): Promise<IHasher> {
	if (algorithm === 'SHA-1') return createSHA1();
	if (algorithm === 'SHA-256') return createSHA256();
	if (algorithm === 'SHA-384') return createSHA384();
	if (algorithm === 'SHA-512') return createSHA512();
	return createCRC32();
}

function normalizeAlgorithmName(value: string): HashAlgorithm | undefined {
	const normalized = value.toUpperCase().replace(/[\s_-]/g, '');
	if (normalized === 'SHA1') return 'SHA-1';
	if (normalized === 'SHA256') return 'SHA-256';
	if (normalized === 'SHA384') return 'SHA-384';
	if (normalized === 'SHA512') return 'SHA-512';
	if (normalized === 'CRC32') return 'CRC32';
	return undefined;
}

function inferAlgorithmFromHash(value: string): HashAlgorithm | undefined {
	const normalized = normalizeHashValue(value);
	const byLength: Record<number, HashAlgorithm> = {
		8: 'CRC32',
		40: 'SHA-1',
		64: 'SHA-256',
		96: 'SHA-384',
		128: 'SHA-512',
	};
	if (!/^[a-f0-9]+$/i.test(normalized)) return undefined;
	return byLength[normalized.length];
}
