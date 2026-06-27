import type { APIRoute } from 'astro';
import { jsonResponse } from '../../lib/cloudflare/env';
import { normalizeIpInfo } from '../../features/tools/catalog/developer/ip-info/functions';

export const prerender = false;

export const GET: APIRoute = ({ request }) => {
	return jsonResponse(normalizeIpInfo(request), {
		headers: {
			'cache-control': 'no-store',
		},
	});
};
