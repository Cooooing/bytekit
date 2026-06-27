import { describe, expect, it } from 'vitest';
import { calculateBinary } from './functions';

describe('二进制运算', () => {
	it('解析常见进制输入并执行 AND', () => {
		const result = calculateBinary({ operation: 'and', input: '1010 0b1111 0x0f 0o17' });
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.result.decimal).toBe('10');
			expect(result.result.binary).toBe('0b1010');
		}
	});

	it('支持任意数量输入的 OR 和 XOR', () => {
		const orResult = calculateBinary({ operation: 'or', input: '0001 0010 0100 1000' });
		expect(orResult.ok && orResult.result.binary).toBe('0b1111');

		const xorResult = calculateBinary({ operation: 'xor', input: '1111 0101 0011' });
		expect(xorResult.ok && xorResult.result.binary).toBe('0b1001');
	});

	it('按位宽计算补运算', () => {
		const notResult = calculateBinary({ operation: 'not', input: '1010', width: 8 });
		expect(notResult.ok && notResult.result.binary).toBe('0b11110101');

		const nandResult = calculateBinary({ operation: 'nand', input: '1111 1010', width: 4 });
		expect(nandResult.ok && nandResult.result.binary).toBe('0b0101');
	});

	it('支持顺序算术运算', () => {
		expect(calculateBinary({ operation: 'subtract', input: '1000 0011 0001' })).toMatchObject({ ok: true, result: { decimal: '4' } });
		expect(calculateBinary({ operation: 'divide', input: '1000 0010' })).toMatchObject({ ok: true, result: { decimal: '4' } });
		expect(calculateBinary({ operation: 'mod', input: '1010 0011' })).toMatchObject({ ok: true, result: { decimal: '1' } });
	});

	it('支持移位和循环移位', () => {
		expect(calculateBinary({ operation: 'shift-left', input: '101', shift: 2 })).toMatchObject({ ok: true, result: { binary: '0b10100' } });
		expect(calculateBinary({ operation: 'shift-right', input: '1010', shift: 1 })).toMatchObject({ ok: true, result: { binary: '0b101' } });
		expect(calculateBinary({ operation: 'rotate-left', input: '1001', width: 4, shift: 1 })).toMatchObject({ ok: true, result: { binary: '0b0011' } });
		expect(calculateBinary({ operation: 'rotate-right', input: '1001', width: 4, shift: 1 })).toMatchObject({ ok: true, result: { binary: '0b1100' } });
	});

	it('返回常见错误', () => {
		expect(calculateBinary({ operation: 'and', input: '' }).ok).toBe(false);
		expect(calculateBinary({ operation: 'and', input: '-1' }).ok).toBe(false);
		expect(calculateBinary({ operation: 'divide', input: '10 0' }).ok).toBe(false);
		expect(calculateBinary({ operation: 'not', input: '1111', width: 2 }).ok).toBe(false);
	});
});
