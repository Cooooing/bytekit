import type { APIRoute } from 'astro';
import { jsonResponse } from '../../lib/cloudflare/env';
import { normalizeCfIpInfo } from '../../features/tools/catalog/developer/ip-info/functions';

export const prerender = false;

export const GET: APIRoute = ({ request }) => {
	return jsonResponse(normalizeCfIpInfo(request), {
		headers: {
			'cache-control': 'no-store',
		},
	});
};
