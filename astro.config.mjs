// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

const isVercel = !!process.env.VERCEL;

// Use Vercel adapter when building on Vercel, Cloudflare otherwise
const adapter = isVercel
	? (await import('@astrojs/vercel')).default()
	: (await import('@astrojs/cloudflare')).default();

// https://astro.build/config
export default defineConfig({
	output: 'static',
	base: '/',
	integrations: [react()],
	adapter,
	vite: isVercel ? {
		build: {
			rollupOptions: {
				external: ['cloudflare:workers'],
			},
		},
	} : {},
});
