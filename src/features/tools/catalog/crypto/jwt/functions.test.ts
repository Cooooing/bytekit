import { describe, expect, it } from 'vitest';
import { decodeJwt } from './functions';
import { stringifyJsonLossless } from '../../../shared/losslessJson';

const tokenWithInt64 = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoyMDc0MDczMTA0MTUzNzYzODQxLCJ1c2VyX2lkIjoyMDc0MDczMTA0MTUzNzYzODQyLCJjcmVhdGVfYXQiOjE3ODM0MDQ1OTAsImV4cCI6MTc4MzQ5MDk5MCwiaWF0IjoxNzgzNDA0NTkwfQ.VU2uQ2jB_fUdOaU8bsBzdypZOcvIe9Ot9ztj8zjxP80`;

describe('JWT 精度处理', () => {
	it('解析 payload 时保留 int64 数字字面量', () => {
		const result = decodeJwt(tokenWithInt64);

		expect(result.ok).toBe(true);
		if (result.ok) {
			const output = stringifyJsonLossless(result.payload, 2);
			expect(output).toContain('"account_id": 2074073104153763841');
			expect(output).toContain('"user_id": 2074073104153763842');
			expect(output).not.toContain('2074073104153763800');
		}
	});

	it('允许粘贴带换行空白的 token', () => {
		const wrapped = tokenWithInt64.replace('.eyJ', '.\n  eyJ');
		const result = decodeJwt(wrapped);

		expect(result.ok).toBe(true);
	});
});
