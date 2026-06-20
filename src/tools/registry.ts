import type { ToolDefinition, ToolCategory, ToolCategoryId } from './types';

// ── Tool definitions (imported from each tool's definition.ts) ──

import { definition as timestampDef } from './developer/timestamp/definition';
import { definition as uuidDef } from './developer/uuid/definition';
import { definition as hashDef } from './developer/hash/definition';
import { definition as colorDef } from './text/color/definition';
import { definition as urlDef } from './encoding/url/definition';
import { definition as regexDef } from './text/regex/definition';
import { definition as diffDef } from './text/diff/definition';
import { definition as markdownDef } from './text/markdown/definition';
import { definition as caseDef } from './text/case/definition';
import { definition as csvDef } from './format/csv/definition';
import { definition as yamlDef } from './format/yaml/definition';
import { definition as cssMinifyDef } from './css/minify/definition';
import { definition as jsonDef } from './json/format/definition';
import { definition as jwtDef } from './crypto/jwt/definition';
import { definition as base64Def } from './encoding/base64/definition';
import { definition as htmlEntityDef } from './encoding/html-entity/definition';
import { definition as jsEscapeDef } from './encoding/js-escape/definition';
import { definition as passwordDef } from './crypto/password/definition';
import { definition as cronDef } from './developer/cron/definition';
import { definition as cssUnitDef } from './css/unit-converter/definition';
import { definition as wordCountDef } from './text/word-count/definition';

export const tools: ToolDefinition[] = [
	timestampDef,
	uuidDef,
	hashDef,
	cronDef,
	colorDef,
	urlDef,
	regexDef,
	diffDef,
	markdownDef,
	caseDef,
	csvDef,
	yamlDef,
	cssMinifyDef,
	jsonDef,
	jwtDef,
	base64Def,
	htmlEntityDef,
	jsEscapeDef,
	passwordDef,
	cssUnitDef,
	wordCountDef,
];

// ── Categories (imported from the first tool in each category) ──

import { category as developerCat } from './developer/timestamp/definition';
import { category as textCat } from './text/color/definition';
import { category as encodingCat } from './encoding/base64/definition';
import { category as cryptoCat } from './crypto/jwt/definition';
import { category as jsonCat } from './json/format/definition';
import { category as formatCat } from './format/csv/definition';
import { category as cssCat } from './css/minify/definition';

export const toolCategories: ToolCategory[] = [
	developerCat,
	encodingCat,
	cryptoCat,
	jsonCat,
	textCat,
	formatCat,
	cssCat,
];

// ── Lookups ──

export function getToolById(id: string) {
	return tools.find((tool) => tool.id === id);
}

export function getCategoryById(id: ToolCategoryId) {
	return toolCategories.find((category) => category.id === id);
}

export function getToolsByCategory(id: ToolCategoryId) {
	return tools.filter((tool) => tool.category === id);
}

// Get the full href with base URL prefix (works across all platforms)
export function getToolHref(tool: ToolDefinition): string {
	const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
	return base + tool.href;
}

// Extract tool ID from a full URL pathname
export function getToolIdFromPathname(pathname: string): string {
	const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
	const relative = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
	const match = relative.match(/^tools\/([^/]+)\/([^/]+)/);
	if (match) {
		const tool = tools.find((t) => t.href === `tools/${match[1]}/${match[2]}`);
		return tool?.id ?? match[2];
	}
	const legacyMatch = relative.match(/^tools\/([^/]+)/);
	return legacyMatch?.[1] ?? '';
}

// Check if a pathname is under the tools section
export function isToolPath(pathname: string): boolean {
	const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
	return pathname.startsWith(base + 'tools/');
}
