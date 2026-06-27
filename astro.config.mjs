// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

const isGitHub = !!process.env.GITHUB_ACTIONS;
const sourceRoot = fileURLToPath(new URL('./src', import.meta.url));

// This project deploys through Cloudflare Workers.
const adapter = (await import('@astrojs/cloudflare')).default();

// GitHub Pages deploys under /bytekit/ subpath; others serve from root
const base = isGitHub ? '/bytekit' : '/';

// https://astro.build/config
export default defineConfig({
	output: 'static',
	base,
	integrations: [react()],
	adapter,
	vite: {
		plugins: [tailwindcss()],
		resolve: {
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
				'@codemirror/lang-css',
				'@codemirror/lang-html',
				'@codemirror/lang-javascript',
				'@codemirror/lang-json',
				'@codemirror/language',
				'@codemirror/state',
				'@codemirror/view',
				'@lezer/highlight',
				'@radix-ui/react-toast',
				'@uiw/react-codemirror',
				'animal-island-ui',
				'js-yaml',
				'jsqr',
				'lucide-react',
				'marked',
				'minisearch',
				'pinyin-pro',
				'qrcode',
			],
		},
	},
});
