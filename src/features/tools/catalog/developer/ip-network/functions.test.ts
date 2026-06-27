import { describe, expect, it } from 'vitest';
import { calculateIpNetwork } from './functions';

describe('calculateIpNetwork', () => {
	it('normalizes IPv4 and returns number formats', () => {
		const result = calculateIpNetwork({ mode: 'auto', input: '192.168.001.001' });
		expect(result.ok && result.result.rows[0]).toMatchObject({
			ok: true,
			kind: 'ipv4',
			normalized: '192.168.1.1',
			decimal: '3232235777',
			hex: '0xC0A80101',
		});
	});

	it('calculates regular IPv4 CIDR ranges', () => {
		const result = calculateIpNetwork({ mode: 'cidr', input: '192.168.1.10/24' });
		expect(result.ok && result.result.rows[0]).toMatchObject({
			ok: true,
			kind: 'cidr',
			network: '192.168.1.0',
			broadcast: '192.168.1.255',
			firstUsable: '192.168.1.1',
			lastUsable: '192.168.1.254',
			totalAddresses: '256',
			usableHosts: '254',
			subnetMask: '255.255.255.0',
			wildcardMask: '0.0.0.255',
		});
	});

	it('handles /31 and /32 CIDR boundaries', () => {
		const p31 = calculateIpNetwork({ mode: 'cidr', input: '10.0.0.0/31' });
		expect(p31.ok && p31.result.rows[0]).toMatchObject({
			firstUsable: '10.0.0.0',
			lastUsable: '10.0.0.1',
			usableHosts: '2',
		});

		const p32 = calculateIpNetwork({ mode: 'cidr', input: '10.0.0.1/32' });
		expect(p32.ok && p32.result.rows[0]).toMatchObject({
			firstUsable: '10.0.0.1',
			lastUsable: '10.0.0.1',
			usableHosts: '1',
		});
	});

	it('converts subnet masks to prefixes', () => {
		const result = calculateIpNetwork({ mode: 'mask', input: '255.255.255.0' });
		expect(result.ok && result.result.rows[0]).toMatchObject({
			ok: true,
			kind: 'mask',
			prefix: 24,
			wildcardMask: '0.0.0.255',
			binary: '11111111.11111111.11111111.00000000',
		});
	});

	it('classifies special IPv4 ranges', () => {
		const result = calculateIpNetwork({ mode: 'batch', input: '127.0.0.1\n224.0.0.1\n8.8.8.8' });
		expect(result.ok && result.result.rows.map((row) => row.ok ? row.types[0] : row.error)).toEqual([
			'回环地址',
			'组播地址',
			'公网地址',
		]);
	});

	it('keeps valid batch rows when another row is invalid', () => {
		const result = calculateIpNetwork({ mode: 'batch', input: '192.168.1.1\n999.1.1.1' });
		expect(result.ok && result.result.rows).toHaveLength(2);
		expect(result.ok && result.result.rows[0].ok).toBe(true);
		expect(result.ok && result.result.rows[1].ok).toBe(false);
	});

	it('returns a global error for a single invalid non-batch input', () => {
		const result = calculateIpNetwork({ mode: 'mask', input: '255.0.255.0' });
		expect(result).toMatchObject({
			ok: false,
			error: '子网掩码必须由连续的 1 和连续的 0 组成。',
		});
	});

	it('normalizes IPv6 addresses', () => {
		const result = calculateIpNetwork({ mode: 'auto', input: '2001:0db8:0000:0000:0000:0000:0000:0001' });
		expect(result.ok && result.result.rows[0]).toMatchObject({
			ok: true,
			kind: 'ipv6',
			normalized: '2001:db8::1',
			types: ['文档示例地址'],
		});
	});

	it('classifies IPv6 special ranges', () => {
		const result = calculateIpNetwork({ mode: 'batch', input: '::1\nfc00::1\nfe80::1\nff02::1' });
		expect(result.ok && result.result.rows.map((row) => row.ok ? row.types[0] : row.error)).toEqual([
			'回环地址',
			'唯一本地地址',
			'链路本地地址',
			'组播地址',
		]);
	});

	it('parses IPv4 ranges', () => {
		const result = calculateIpNetwork({ mode: 'auto', input: '192.168.1.1-192.168.1.20' });
		expect(result.ok && result.result.rows[0]).toMatchObject({
			ok: true,
			kind: 'range',
			totalAddresses: '20',
		});
	});
});
