import type { ToolDefinition } from '../../types';

export const definition: ToolDefinition = {
	id: 'ip-info',
	href: 'tools/developer/ip-info',
	name: 'IP 信息查询',
	shortName: 'IP Info',
	description: '查询当前访问 IP 的 Cloudflare 请求信息，包括地理位置、ASN、机房和连接信息。',
	category: 'developer',
	keywords: ['ip', 'ip info', 'cloudflare', 'asn', 'geo', 'colo', '公网 ip', '归属地', '信息查询'],
};
