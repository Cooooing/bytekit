// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

const isVercel = !!process.env.VERCEL;
const isGitHub = !!process.env.GITHUB_ACTIONS;

// Use Vercel adapter when building on Vercel, Cloudflare otherwise
const adapter = isVercel
	? (await import('@astrojs/vercel')).default()
	: (await import('@astrojs/cloudflare')).default();

// GitHub Pages deploys under /bytekit/ subpath; others serve from root
const base = isGitHub ? '/bytekit' : '/';

// https://astro.build/config
export default defineConfig({
	output: 'static',
	base,
	integrations: [react()],
	adapter,
	vite: {
		build: {
			rollupOptions: {
				...(!isVercel ? {
					output: {
						manualChunks: {
							'react-vendor': ['react', 'react-dom'],
							'codemirror-core': ['@codemirror/view', '@codemirror/state'],
						},
					},
				} : {}),
				...(isVercel ? { external: ['cloudflare:workers'] } : {}),
			},
		},
	},
});
