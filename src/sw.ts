/// <reference lib="webworker" />
import { cleanupOutdatedCaches, matchPrecache, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { getOfflinePageCandidates } from './app/offline/navigation';

// 独立 Worker 构建不会注入 Node 环境变量，Workbox 运行时需要这个生产标记。
const process = { env: { NODE_ENV: 'production' } };

declare let self: ServiceWorkerGlobalScope & typeof globalThis & {
	__WB_MANIFEST: Array<{ url: string; revision?: string | null }>;
};

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

registerRoute(new NavigationRoute(async ({ url }) => {
	for (const candidate of getOfflinePageCandidates(url.pathname)) {
		const response = await matchPrecache(candidate);
		if (response) return response;
	}
	return Response.error();
}, {
	denylist: [/\/api(?:\/|$)/, /\/health(?:\/|$)/],
}));
