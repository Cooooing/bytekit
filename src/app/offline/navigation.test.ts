import { describe, expect, it } from 'vitest';
import { getOfflinePageCandidates } from './navigation';

describe('getOfflinePageCandidates', () => {
	it('目录工具路径优先匹配对应预缓存页面', () => {
		expect(getOfflinePageCandidates('/tools/json/format/')).toEqual(['/tools/json/format/index.html']);
	});

	it('首页保持 index 页面候选路径', () => {
		expect(getOfflinePageCandidates('/')).toEqual(['/index.html']);
	});
});
