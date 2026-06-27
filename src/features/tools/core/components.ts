import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { toolEntries } from './manifest';

type ToolComponent = ComponentType;
type ToolComponentModule = Promise<{ default: ToolComponent }>;

const loaders = new Map(toolEntries.map((entry) => [entry.definition.id, entry.loadComponent]));
const loadCache = new Map<string, ToolComponentModule>();

function loadToolComponent(toolId: string): ToolComponentModule | undefined {
	const cached = loadCache.get(toolId);
	if (cached) return cached;
	const loader = loaders.get(toolId);
	if (!loader) return undefined;
	const promise = loader();
	loadCache.set(toolId, promise);
	return promise;
}

export const toolComponents = Object.fromEntries(
	toolEntries.map((entry) => [
		entry.definition.id,
		lazy(() => loadToolComponent(entry.definition.id) ?? Promise.reject(new Error(`工具组件未注册：${entry.definition.id}`))),
	]),
) as Record<string, LazyExoticComponent<ToolComponent>>;

export function preloadToolComponent(toolId: string) {
	void loadToolComponent(toolId);
}
