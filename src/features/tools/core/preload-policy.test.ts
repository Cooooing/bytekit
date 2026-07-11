import { describe, expect, it } from 'vitest';
import { allowsPassivePreload } from './preload-policy';

describe('allowsPassivePreload', () => {
	it('默认网络允许意图预取', () => {
		expect(allowsPassivePreload()).toBe(true);
		expect(allowsPassivePreload({ effectiveType: '4g' })).toBe(true);
	});

	it('省流量和慢速网络只在明确按下时加载', () => {
		expect(allowsPassivePreload({ saveData: true })).toBe(false);
		expect(allowsPassivePreload({ effectiveType: 'slow-2g' })).toBe(false);
		expect(allowsPassivePreload({ effectiveType: '2g' })).toBe(false);
	});
});
