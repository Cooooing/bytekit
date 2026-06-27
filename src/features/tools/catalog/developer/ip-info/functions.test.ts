import { describe, expect, it } from 'vitest';
import { normalizeCfIpInfo } from './functions';

describe('normalizeCfIpInfo', () => {
	it('normalizes full Cloudflare request metadata', () => {
		const request = withCf(new Request('https://bytekit.local/api/ip-info', {
			headers: { 'CF-Connecting-IP': '203.0.113.10' },
		}), {
			country: 'US',
			city: 'San Francisco',
			region: 'California',
			regionCode: 'CA',
			continent: 'NA',
			timezone: 'America/Los_Angeles',
			latitude: '37.7749',
			longitude: '-122.4194',
			postalCode: '94107',
			asn: 13335,
			asOrganization: 'Cloudflare, Inc.',
			colo: 'SFO',
			httpProtocol: 'HTTP/3',
			clientTcpRtt: 12,
			clientQuicRtt: 8,
			tlsVersion: 'TLSv1.3',
			tlsCipher: 'AEAD-AES128-GCM-SHA256',
		});

		expect(normalizeCfIpInfo(request)).toMatchObject({
			ok: true,
			available: true,
			source: 'cloudflare',
			ip: '203.0.113.10',
			cf: {
				country: 'US',
				city: 'San Francisco',
				asn: '13335',
				asOrganization: 'Cloudflare, Inc.',
				colo: 'SFO',
				tlsVersion: 'TLSv1.3',
			},
		});
	});

	it('keeps partial metadata when the IP header is absent', () => {
		const request = withCf(new Request('https://bytekit.local/api/ip-info'), {
			country: 'JP',
			colo: 'NRT',
		});

		expect(normalizeCfIpInfo(request)).toMatchObject({
			available: true,
			cf: {
				country: 'JP',
				colo: 'NRT',
			},
		});
	});

	it('marks non-Cloudflare environments as unavailable', () => {
		const request = new Request('https://bytekit.local/api/ip-info');
		expect(normalizeCfIpInfo(request)).toMatchObject({
			ok: true,
			available: false,
			source: 'cloudflare',
			cf: {},
			message: '当前环境未提供 Cloudflare 请求信息。',
		});
	});

	it('drops empty fields', () => {
		const request = withCf(new Request('https://bytekit.local/api/ip-info', {
			headers: { 'CF-Connecting-IP': ' 198.51.100.20 ' },
		}), {
			country: '',
			city: '  ',
			asn: 64500,
		});

		expect(normalizeCfIpInfo(request)).toEqual({
			ok: true,
			available: true,
			source: 'cloudflare',
			ip: '198.51.100.20',
			cf: { asn: '64500' },
		});
	});
});

function withCf(request: Request, cf: Record<string, unknown>): Request {
	Object.defineProperty(request, 'cf', {
		value: cf,
		configurable: true,
	});
	return request;
}
