import { toolCategories, toolEntries } from './manifest';
import type { ToolCategoryId, ToolDefinition } from './types';

export const tools: ToolDefinition[] = toolEntries.map((entry) => entry.definition);
export { toolCategories };

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
