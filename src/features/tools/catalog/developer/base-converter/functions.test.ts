import { describe, expect, it } from 'vitest';
import { convertBases } from './functions';

describe('进制转换器', () => {
	it('自动识别常见前缀', () => {
		const result = convertBases({ input: '0b1010\n0xff', inputMode: 'auto', sourceBase: 10, targetBase: 36 });
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.result.rows[0]).toMatchObject({ decimal: '10', hex: '0xA' });
			expect(result.result.rows[1]).toMatchObject({ decimal: '255', binary: '0b11111111' });
		}
	});

	it('支持自定义源进制和目标进制', () => {
		const result = convertBases({ input: 'ZZ', inputMode: 'custom', sourceBase: 36, targetBase: 2 });
		expect(result).toMatchObject({ ok: true, result: { rows: [{ decimal: '1295', custom: '10100001111' }] } });
	});

	it('支持负数和下划线分隔符', () => {
		const result = convertBases({ input: '-1_024', inputMode: 'base-10', sourceBase: 10, targetBase: 16 });
		expect(result).toMatchObject({ ok: true, result: { rows: [{ binary: '-0b10000000000', hex: '-0x400', custom: '-400' }] } });
	});

	it('返回非法输入错误', () => {
		expect(convertBases({ input: '', inputMode: 'auto', sourceBase: 10, targetBase: 16 }).ok).toBe(false);
		expect(convertBases({ input: '102', inputMode: 'base-2', sourceBase: 2, targetBase: 10 }).ok).toBe(false);
		expect(convertBases({ input: '10', inputMode: 'custom', sourceBase: 1, targetBase: 10 }).ok).toBe(false);
		expect(convertBases({ input: '10', inputMode: 'auto', sourceBase: 10, targetBase: 37 }).ok).toBe(false);
	});
});
