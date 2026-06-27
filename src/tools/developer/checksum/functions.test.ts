import { describe, expect, it } from 'vitest';
import { calculateChecksum } from './functions';

describe('校验码计算器', () => {
	it('计算 CRC 标准测试向量', () => {
		expect(calculateChecksum({ algorithm: 'crc16-modbus', inputMode: 'text', input: '123456789' })).toMatchObject({ ok: true, result: { hex: '0x4B37' } });
		expect(calculateChecksum({ algorithm: 'crc16-ccitt-false', inputMode: 'text', input: '123456789' })).toMatchObject({ ok: true, result: { hex: '0x29B1' } });
		expect(calculateChecksum({ algorithm: 'crc16-xmodem', inputMode: 'text', input: '123456789' })).toMatchObject({ ok: true, result: { hex: '0x31C3' } });
		expect(calculateChecksum({ algorithm: 'crc16-kermit', inputMode: 'text', input: '123456789' })).toMatchObject({ ok: true, result: { hex: '0x2189' } });
		expect(calculateChecksum({ algorithm: 'crc32', inputMode: 'text', input: '123456789' })).toMatchObject({ ok: true, result: { hex: '0xCBF43926' } });
	});

	it('解析 Hex 字节并输出字节序', () => {
		const result = calculateChecksum({ algorithm: 'crc16-modbus', inputMode: 'hex', input: '01 03 00 00 00 02' });
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.result.hex).toBe('0x0BC4');
			expect(result.result.highFirst).toBe('0B C4');
			expect(result.result.lowFirst).toBe('C4 0B');
			expect(result.result.byteLength).toBe(6);
		}
	});

	it('支持二进制字节、LRC 和 BCC', () => {
		expect(calculateChecksum({ algorithm: 'lrc', inputMode: 'hex', input: '01 03 00 00 00 02' })).toMatchObject({ ok: true, result: { hex: '0xFA' } });
		expect(calculateChecksum({ algorithm: 'bcc', inputMode: 'hex', input: '01 03 00 00 00 02' })).toMatchObject({ ok: true, result: { hex: '0x00' } });
		expect(calculateChecksum({ algorithm: 'crc8', inputMode: 'binary', input: '00110001 00110010 00110011' }).ok).toBe(true);
	});

	it('支持 CRC16 自定义参数', () => {
		const result = calculateChecksum({
			algorithm: 'crc16-custom',
			inputMode: 'text',
			input: '123456789',
			customCrc16: {
				poly: '0x8005',
				init: '0xffff',
				xorout: '0x0000',
				refin: true,
				refout: true,
			},
		});
		expect(result).toMatchObject({ ok: true, result: { hex: '0x4B37' } });
	});

	it('返回常见输入错误', () => {
		expect(calculateChecksum({ algorithm: 'crc16-modbus', inputMode: 'hex', input: '123' }).ok).toBe(false);
		expect(calculateChecksum({ algorithm: 'crc16-modbus', inputMode: 'hex', input: '12xz' }).ok).toBe(false);
		expect(calculateChecksum({ algorithm: 'crc16-modbus', inputMode: 'binary', input: '101' }).ok).toBe(false);
		expect(calculateChecksum({ algorithm: 'crc16-modbus', inputMode: 'text', input: '' }).ok).toBe(false);
	});
});
