export type IpInfoSource = 'cloudflare' | 'vercel' | 'generic' | 'unavailable';

export interface PlatformIpInfo {
	country?: string;
	city?: string;
	region?: string;
	regionCode?: string;
	continent?: string;
	timezone?: string;
	latitude?: string;
	longitude?: string;
	postalCode?: string;
	asn?: string;
	asOrganization?: string;
	colo?: string;
	httpProtocol?: string;
	clientTcpRtt?: string;
	clientQuicRtt?: string;
	tlsVersion?: string;
	tlsCipher?: string;
}

export interface IpInfoResponse {
	ok: true;
	available: boolean;
	source: IpInfoSource;
	ip?: string;
	info: PlatformIpInfo;
	message?: string;
}

type RequestWithCloudflare = Request & {
	cf?: Record<string, unknown>;
};

const cfFieldNames = [
	'country',
	'city',
	'region',
	'regionCode',
	'continent',
	'timezone',
	'latitude',
	'longitude',
	'postalCode',
	'asn',
	'asOrganization',
	'colo',
	'httpProtocol',
	'clientTcpRtt',
	'clientQuicRtt',
	'tlsVersion',
	'tlsCipher',
] as const;

export function normalizeIpInfo(request: Request): IpInfoResponse {
	const cloudflare = normalizeCloudflareInfo(request);
	if (cloudflare.available) return cloudflare;

	const vercel = normalizeVercelInfo(request);
	if (vercel.available) return vercel;

	const generic = normalizeGenericInfo(request);
	if (generic.available) return generic;

	return {
		ok: true,
		available: false,
		source: 'unavailable',
		info: {},
		message: '当前部署环境未提供服务端 IP 请求信息。',
	};
}

export function normalizeCloudflareInfo(request: Request): IpInfoResponse {
	const ip = normalizeHeader(request.headers.get('CF-Connecting-IP'));
	const rawCf = (request as RequestWithCloudflare).cf ?? {};
	const info = normalizeCfFields(rawCf);
	const available = Boolean(ip || Object.keys(info).length > 0);

	return {
		ok: true,
		available,
		source: available ? 'cloudflare' : 'unavailable',
		...(ip ? { ip } : {}),
		info,
		...(available ? {} : { message: '当前环境未提供 Cloudflare 请求信息。' }),
	};
}

function normalizeVercelInfo(request: Request): IpInfoResponse {
	const headers = request.headers;
	const hasVercelSignal = hasAnyHeader(headers, [
		'x-vercel-id',
		'x-vercel-ip-country',
		'x-vercel-ip-city',
		'x-vercel-ip-country-region',
		'x-vercel-ip-timezone',
		'x-vercel-ip-latitude',
		'x-vercel-ip-longitude',
	]);
	const ip = getFirstHeader(headers, ['x-forwarded-for', 'x-real-ip', 'x-vercel-forwarded-for']);
	const info: PlatformIpInfo = {
		country: normalizeHeader(headers.get('x-vercel-ip-country')),
		city: decodeHeader(headers.get('x-vercel-ip-city')),
		region: decodeHeader(headers.get('x-vercel-ip-country-region')),
		regionCode: normalizeHeader(headers.get('x-vercel-ip-country-region')),
		timezone: normalizeHeader(headers.get('x-vercel-ip-timezone')),
		latitude: normalizeHeader(headers.get('x-vercel-ip-latitude')),
		longitude: normalizeHeader(headers.get('x-vercel-ip-longitude')),
	};
	const cleaned = dropEmpty(info);
	const available = hasVercelSignal && Boolean(ip || Object.keys(cleaned).length > 0);

	return {
		ok: true,
		available,
		source: available ? 'vercel' : 'unavailable',
		...(ip ? { ip } : {}),
		info: cleaned,
		...(available ? {} : { message: '当前环境未提供 Vercel 请求信息。' }),
	};
}

function normalizeGenericInfo(request: Request): IpInfoResponse {
	const ip = getFirstHeader(request.headers, ['x-forwarded-for', 'x-real-ip', 'forwarded']);
	if (!ip) {
		return {
			ok: true,
			available: false,
			source: 'unavailable',
			info: {},
			message: '当前部署环境未提供通用转发请求头。',
		};
	}

	return {
		ok: true,
		available: true,
		source: 'generic',
		ip,
		info: {},
	};
}

function normalizeCfFields(rawCf: Record<string, unknown>): PlatformIpInfo {
	const normalized: PlatformIpInfo = {};
	for (const field of cfFieldNames) {
		const value = normalizeValue(rawCf[field]);
		if (value) normalized[field] = value;
	}
	return normalized;
}

function getFirstHeader(headers: Headers, names: string[]): string | undefined {
	for (const name of names) {
		const value = headers.get(name);
		if (!value) continue;
		if (name === 'forwarded') {
			const forwardedIp = parseForwardedFor(value);
			if (forwardedIp) return forwardedIp;
			continue;
		}
		const first = normalizeHeader(value.split(',')[0]);
		if (first) return first;
	}
	return undefined;
}

function hasAnyHeader(headers: Headers, names: string[]): boolean {
	return names.some((name) => Boolean(normalizeHeader(headers.get(name))));
}

function parseForwardedFor(value: string): string | undefined {
	const match = value.match(/(?:^|;|,)\s*for=(?:"?)([^";,\s]+)(?:"?)/i);
	return normalizeHeader(match?.[1] ?? null);
}

function dropEmpty(info: PlatformIpInfo): PlatformIpInfo {
	return Object.fromEntries(Object.entries(info).filter(([, value]) => Boolean(value))) as PlatformIpInfo;
}

function decodeHeader(value: string | null): string | undefined {
	const normalized = normalizeHeader(value);
	if (!normalized) return undefined;
	try {
		return decodeURIComponent(normalized);
	} catch {
		return normalized;
	}
}

function normalizeHeader(value: string | null): string | undefined {
	const normalized = value?.trim();
	return normalized || undefined;
}

function normalizeValue(value: unknown): string | undefined {
	if (value === null || value === undefined) return undefined;
	const normalized = String(value).trim();
	return normalized || undefined;
}
