import { describe, expect, it } from 'vitest';
import { computeHashes } from './functions';

describe('Hash 计算', () => {
	it('计算标准 SHA 摘要', async () => {
		const result = await computeHashes('abc');
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.hashes['SHA-1']).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
			expect(result.hashes['SHA-256']).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
		}
	});
});
