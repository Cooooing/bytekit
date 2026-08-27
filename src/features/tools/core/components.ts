import type { ComponentType } from 'react';
import { toolEntries } from './manifest';
import { preloadCodeEditor } from '../shared/CodeEditor';

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

export { loadToolComponent };

export function preloadToolComponent(toolId: string) {
	void loadToolComponent(toolId);
}

const codeEditorToolIds = new Set([
	'base64', 'css-minify', 'csv', 'html-entity', 'html-format', 'javascript-escape', 'json', 'jsonpath',
	'json-to-proto', 'jwt', 'markdown', 'mathjax', 'proto-to-json', 'websocket', 'word-count', 'xml', 'yaml',
]);

export function preloadToolResources(toolId: string) {
	preloadToolComponent(toolId);
	if (codeEditorToolIds.has(toolId)) preloadCodeEditor();
}
