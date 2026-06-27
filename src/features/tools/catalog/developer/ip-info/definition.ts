import type { ToolDefinition } from '../../types';

export const definition: ToolDefinition = {
	id: 'ip-info',
	href: 'tools/developer/ip-info',
	name: 'IP 信息查询',
	shortName: 'IP Info',
	description: '查询当前访问 IP 的平台请求信息，支持 Cloudflare、Vercel 和通用服务端请求头。',
	category: 'developer',
	keywords: ['ip', 'ip info', 'cloudflare', 'vercel', 'asn', 'geo', 'colo', '公网 ip', '归属地', '信息查询'],
};
