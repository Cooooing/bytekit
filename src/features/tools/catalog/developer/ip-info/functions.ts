export interface CloudflareIpInfo {
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
	source: 'cloudflare';
	ip?: string;
	cf: CloudflareIpInfo;
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

export function normalizeCfIpInfo(request: Request): IpInfoResponse {
	const ip = normalizeHeader(request.headers.get('CF-Connecting-IP'));
	const rawCf = (request as RequestWithCloudflare).cf ?? {};
	const cf = normalizeCfFields(rawCf);
	const available = Boolean(ip || Object.keys(cf).length > 0);

	return {
		ok: true,
		available,
		source: 'cloudflare',
		...(ip ? { ip } : {}),
		cf,
		...(available ? {} : { message: '当前环境未提供 Cloudflare 请求信息。' }),
	};
}

function normalizeCfFields(rawCf: Record<string, unknown>): CloudflareIpInfo {
	const normalized: CloudflareIpInfo = {};
	for (const field of cfFieldNames) {
		const value = normalizeValue(rawCf[field]);
		if (value) normalized[field] = value;
	}
	return normalized;
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
