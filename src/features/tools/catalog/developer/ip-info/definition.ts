import type { ToolDefinition } from '../../types';

export const definition: ToolDefinition = {
	id: 'ip-info',
	href: 'tools/developer/ip-info',
	name: 'IP 信息查询',
	shortName: 'IP Info',
	description: '查询当前访问 IP、平台请求信息和浏览器环境信息。',
	category: 'developer',
	keywords: ['ip', 'ip info', 'cloudflare', 'vercel', 'asn', 'geo', 'colo', '公网 ip', '归属地', '信息查询'],
};
