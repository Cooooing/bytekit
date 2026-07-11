// @ts-check
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import { build as viteBuild } from 'vite';
import { injectManifest } from 'workbox-build';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const isGitHub = !!process.env.GITHUB_ACTIONS;
const sourceRoot = fileURLToPath(new URL('./src', import.meta.url));

// This project deploys through Cloudflare Workers.
const adapter = (await import('@astrojs/cloudflare')).default();

// GitHub Pages deploys under /bytekit/ subpath; others serve from root
const base = isGitHub ? '/bytekit' : '/';
const pwaBase = `${base}/`.replace(/\/+/g, '/');

const offlineServiceWorker = {
	name: 'bytekit-offline-service-worker',
	hooks: {
		'astro:build:done': async ({ dir }) => {
			const outDir = fileURLToPath(dir);
			const swPath = resolve(outDir, 'sw.js');
			await viteBuild({
				configFile: false,
				base: pwaBase,
				define: { 'process.env.NODE_ENV': '"production"' },
				build: {
					outDir,
					emptyOutDir: false,
					lib: { entry: resolve('src/sw.ts'), formats: ['iife'], name: 'BytekitServiceWorker', fileName: () => 'sw.js' },
				},
			});
			await injectManifest({
				swSrc: swPath,
				swDest: swPath,
				globDirectory: outDir,
				globPatterns: ['**/*.{css,html,ico,js,json,mjs,png,svg,webmanifest,woff,woff2,wasm}'],
				globIgnores: ['sw.js'],
				maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
			});
		},
	},
};

// https://astro.build/config
export default defineConfig({
	output: 'static',
	base,
	integrations: [react(), offlineServiceWorker],
	adapter,
	vite: {
		plugins: [
			tailwindcss(),
			VitePWA({
				strategies: 'injectManifest',
				srcDir: 'src',
				outDir: 'dist/client',
				filename: 'sw.ts',
				injectRegister: false,
				registerType: 'prompt',
				base: pwaBase,
				manifest: {
					name: 'Bytekit 开发工具站',
					short_name: 'Bytekit',
					description: '本地优先的开发工具站',
					id: pwaBase,
					start_url: pwaBase,
					scope: pwaBase,
					display: 'standalone',
					background_color: '#ffffff',
					theme_color: '#ffffff',
					icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
				},
				injectManifest: {
					maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
				},
				devOptions: { enabled: false },
			}),
		],
		resolve: {
			dedupe: ['react', 'react-dom'],
			alias: {
				'@app': fileURLToPath(new URL('./src/app', import.meta.url)),
				'@features': fileURLToPath(new URL('./src/features', import.meta.url)),
				'@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
				'@themes': fileURLToPath(new URL('./src/themes', import.meta.url)),
				'@': sourceRoot,
			},
		},
		optimizeDeps: {
			include: [
				'@radix-ui/react-toast',
				'lucide-react',
				'minisearch',
			],
		},
	},
});
