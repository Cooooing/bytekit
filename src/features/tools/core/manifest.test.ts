import { describe, expect, it } from 'vitest';
import { toolCategories, toolEntries } from './manifest';

describe('tool manifest', () => {
	it('keeps tool ids and hrefs unique', () => {
		const ids = toolEntries.map((entry) => entry.definition.id);
		const hrefs = toolEntries.map((entry) => entry.definition.href);

		expect(new Set(ids).size).toBe(ids.length);
		expect(new Set(hrefs).size).toBe(hrefs.length);
	});

	it('only references declared categories', () => {
		const categoryIds = new Set(toolCategories.map((category) => category.id));

		for (const entry of toolEntries) {
			expect(categoryIds.has(entry.definition.category), entry.definition.id).toBe(true);
		}
	});

	it('declares valid tool routes and loaders', () => {
		for (const entry of toolEntries) {
			expect(entry.definition.href, entry.definition.id).toMatch(/^tools\/[^/]+\/[^/]+$/);
			expect(typeof entry.loadComponent, entry.definition.id).toBe('function');
		}
	});
});
