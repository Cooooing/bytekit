import { describe, expect, it } from 'vitest';
import { normalizeCloudflareInfo, normalizeIpInfo } from './functions';

describe('normalizeIpInfo', () => {
	it('prefers Cloudflare request metadata when present', () => {
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

		expect(normalizeIpInfo(request)).toMatchObject({
			ok: true,
			available: true,
			source: 'cloudflare',
			ip: '203.0.113.10',
			info: {
				country: 'US',
				city: 'San Francisco',
				asn: '13335',
				asOrganization: 'Cloudflare, Inc.',
				colo: 'SFO',
				tlsVersion: 'TLSv1.3',
			},
		});
	});

	it('normalizes Vercel geolocation headers', () => {
		const request = new Request('https://bytekit.local/api/ip-info', {
			headers: {
				'x-forwarded-for': '198.51.100.20, 10.0.0.1',
				'x-vercel-id': 'hnd1::abc123',
				'x-vercel-ip-country': 'JP',
				'x-vercel-ip-city': 'Tokyo',
				'x-vercel-ip-country-region': '13',
				'x-vercel-ip-timezone': 'Asia/Tokyo',
				'x-vercel-ip-latitude': '35.6895',
				'x-vercel-ip-longitude': '139.69171',
			},
		});

		expect(normalizeIpInfo(request)).toEqual({
			ok: true,
			available: true,
			source: 'vercel',
			ip: '198.51.100.20',
			info: {
				country: 'JP',
				city: 'Tokyo',
				region: '13',
				regionCode: '13',
				timezone: 'Asia/Tokyo',
				latitude: '35.6895',
				longitude: '139.69171',
			},
		});
	});

	it('decodes URL-encoded Vercel city names', () => {
		const request = new Request('https://bytekit.local/api/ip-info', {
			headers: {
				'x-real-ip': '198.51.100.21',
				'x-vercel-id': 'iad1::abc123',
				'x-vercel-ip-city': 'Los%20Angeles',
			},
		});

		expect(normalizeIpInfo(request)).toMatchObject({
			source: 'vercel',
			ip: '198.51.100.21',
			info: { city: 'Los Angeles' },
		});
	});

	it('falls back to generic forwarded headers', () => {
		const request = new Request('https://bytekit.local/api/ip-info', {
			headers: { forwarded: 'for=192.0.2.44;proto=https' },
		});

		expect(normalizeIpInfo(request)).toEqual({
			ok: true,
			available: true,
			source: 'generic',
			ip: '192.0.2.44',
			info: {},
		});
	});

	it('treats x-forwarded-for without Vercel markers as generic', () => {
		const request = new Request('https://bytekit.local/api/ip-info', {
			headers: { 'x-forwarded-for': '192.0.2.45' },
		});

		expect(normalizeIpInfo(request)).toEqual({
			ok: true,
			available: true,
			source: 'generic',
			ip: '192.0.2.45',
			info: {},
		});
	});

	it('marks static or unsupported environments as unavailable', () => {
		const request = new Request('https://bytekit.local/api/ip-info');
		expect(normalizeIpInfo(request)).toMatchObject({
			ok: true,
			available: false,
			source: 'unavailable',
			info: {},
			message: '当前部署环境未提供服务端 IP 请求信息。',
		});
	});

	it('keeps the Cloudflare-only normalizer available', () => {
		const request = withCf(new Request('https://bytekit.local/api/ip-info'), {
			country: 'JP',
			colo: 'NRT',
		});

		expect(normalizeCloudflareInfo(request)).toMatchObject({
			available: true,
			source: 'cloudflare',
			info: {
				country: 'JP',
				colo: 'NRT',
			},
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

		expect(normalizeIpInfo(request)).toEqual({
			ok: true,
			available: true,
			source: 'cloudflare',
			ip: '198.51.100.20',
			info: { asn: '64500' },
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
