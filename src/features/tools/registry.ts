import type { ToolDefinition, ToolCategory, ToolCategoryId } from '../../tools/types';

import { definition as timestampDef } from '../../tools/developer/timestamp/definition';
import { definition as uuidDef } from '../../tools/developer/uuid/definition';
import { definition as hashDef } from '../../tools/developer/hash/definition';
import { definition as binaryDef } from '../../tools/developer/binary/definition';
import { definition as colorDef } from '../../tools/text/color/definition';
import { definition as urlDef } from '../../tools/encoding/url/definition';
import { definition as regexDef } from '../../tools/text/regex/definition';
import { definition as diffDef } from '../../tools/text/diff/definition';
import { definition as markdownDef } from '../../tools/text/markdown/definition';
import { definition as caseDef } from '../../tools/text/case/definition';
import { definition as csvDef } from '../../tools/format/csv/definition';
import { definition as yamlDef } from '../../tools/format/yaml/definition';
import { definition as cssMinifyDef } from '../../tools/css/minify/definition';
import { definition as jsonDef } from '../../tools/json/format/definition';
import { definition as jwtDef } from '../../tools/crypto/jwt/definition';
import { definition as base64Def } from '../../tools/encoding/base64/definition';
import { definition as htmlEntityDef } from '../../tools/encoding/html-entity/definition';
import { definition as jsEscapeDef } from '../../tools/encoding/js-escape/definition';
import { definition as passwordDef } from '../../tools/crypto/password/definition';
import { definition as cronDef } from '../../tools/developer/cron/definition';
import { definition as cssUnitDef } from '../../tools/css/unit-converter/definition';
import { definition as wordCountDef } from '../../tools/text/word-count/definition';
import { definition as nanoidDef } from '../../tools/developer/nanoid/definition';
import { definition as jsonPathDef } from '../../tools/json/jsonpath/definition';
import { definition as xmlDef } from '../../tools/format/xml/definition';
import { definition as loremDef } from '../../tools/text/lorem/definition';
import { definition as htmlFormatDef } from '../../tools/format/html/definition';

import { category as developerCat } from '../../tools/developer/timestamp/definition';
import { category as textCat } from '../../tools/text/color/definition';
import { category as encodingCat } from '../../tools/encoding/base64/definition';
import { category as cryptoCat } from '../../tools/crypto/jwt/definition';
import { category as jsonCat } from '../../tools/json/format/definition';
import { category as formatCat } from '../../tools/format/csv/definition';
import { category as cssCat } from '../../tools/css/minify/definition';

export const tools: ToolDefinition[] = [
	timestampDef,
	uuidDef,
	hashDef,
	binaryDef,
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
	nanoidDef,
	jsonPathDef,
	xmlDef,
	loremDef,
	htmlFormatDef,
];

export const toolCategories: ToolCategory[] = [
	developerCat,
	encodingCat,
	cryptoCat,
	jsonCat,
	textCat,
	formatCat,
	cssCat,
];

const toolById = new Map(tools.map((tool) => [tool.id, tool]));
const toolByHref = new Map(tools.map((tool) => [tool.href, tool]));
const categoryById = new Map(toolCategories.map((category) => [category.id, category]));
const toolsByCategory = tools.reduce((map, tool) => {
	const current = map.get(tool.category) ?? [];
	current.push(tool);
	map.set(tool.category, current);
	return map;
}, new Map<ToolCategoryId, ToolDefinition[]>());

export function getToolById(id: string) {
	return toolById.get(id);
}

export function getCategoryById(id: ToolCategoryId) {
	return categoryById.get(id);
}

export function getToolsByCategory(id: ToolCategoryId) {
	return toolsByCategory.get(id) ?? [];
}

export function getToolHref(tool: ToolDefinition): string {
	const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
	return base + tool.href;
}

export function getToolIdFromPathname(pathname: string): string {
	const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
	const relative = pathname.startsWith(base) ? pathname.slice(base.length) : pathname.replace(/^\/+/, '');
	const match = relative.match(/^tools\/([^/]+)\/([^/]+)/);
	if (match) {
		const tool = toolByHref.get(`tools/${match[1]}/${match[2]}`);
		return tool?.id ?? match[2];
	}
	const legacyMatch = relative.match(/^tools\/([^/]+)/);
	return legacyMatch?.[1] ?? '';
}

export function isToolPath(pathname: string): boolean {
	const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
	return pathname.startsWith(base + 'tools/') || pathname.replace(/^\/+/, '').startsWith('tools/');
}

export type { ToolCategoryId, ToolDefinition };
