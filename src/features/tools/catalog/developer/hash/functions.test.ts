import { describe, expect, it } from 'vitest';
import { compareExpectedHash, computeByteHashes, computeHashes, createHashers, parseExpectedHash } from './functions';

describe('Hash 计算', () => {
	it('计算标准 SHA 摘要', async () => {
		const result = await computeHashes('abc', ['SHA-1', 'SHA-256']);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.hashes['SHA-1']).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
			expect(result.hashes['SHA-256']).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
		}
	});

	it('计算二进制数据 Hash', async () => {
		const result = await computeByteHashes(new TextEncoder().encode('abc'), ['SHA-256', 'CRC32']);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.hashes['SHA-256']).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
			expect(result.hashes.CRC32).toBe('352441c2');
		}
	});

	it('分片更新和一次性计算结果一致', async () => {
		const data = new TextEncoder().encode('abcdef');
		const full = await computeByteHashes(data, ['SHA-256']);
		const [chunked] = await createHashers(['SHA-256']);
		chunked.hasher.update(data.slice(0, 2));
		chunked.hasher.update(data.slice(2, 4));
		chunked.hasher.update(data.slice(4));

		expect(full.ok).toBe(true);
		if (full.ok) expect(chunked.hasher.digest('hex')).toBe(full.hashes['SHA-256']);
	});

	it('解析带算法前缀的校验值', () => {
		expect(parseExpectedHash('sha256: BA78 16BF')).toEqual({
			algorithm: 'SHA-256',
			value: 'ba7816bf',
		});
		expect(parseExpectedHash('CRC32 352441C2')).toEqual({
			algorithm: 'CRC32',
			value: '352441c2',
		});
	});

	it('校验时忽略大小写和空白', () => {
		const compare = compareExpectedHash('SHA-256: BA7816BF 8F01CFEA414140DE5DAE2223B00361A396177A9CB410FF61F20015AD', {
			'SHA-256': 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
		});
		expect(compare.status).toBe('matched');
	});

	it('识别校验不匹配', () => {
		const compare = compareExpectedHash('sha256:deadbeef', {
			'SHA-256': 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
		});
		expect(compare.status).toBe('mismatched');
	});

	it('识别未选择的算法', () => {
		const compare = compareExpectedHash('crc32:352441c2', {
			'SHA-256': 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
		});
		expect(compare.status).toBe('unknown-algorithm');
	});
});
