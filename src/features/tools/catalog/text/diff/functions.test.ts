import { describe, expect, it } from 'vitest';
import { diffLines } from './functions';

describe('文本差异对比', () => {
	it('返回新增、删除和相同行', () => {
		const rows = diffLines('a\nb\nc', 'a\nB\nc\nd');
		expect(rows.some((row) => row.left.type === 'removed')).toBe(true);
		expect(rows.some((row) => row.right.type === 'added')).toBe(true);
		expect(rows.filter((row) => row.left.type === 'equal')).toHaveLength(2);
	});

	it('拒绝过大的对比矩阵', () => {
		const left = Array.from({ length: 800 }, (_, index) => `a${index}`).join('\n');
		const right = Array.from({ length: 800 }, (_, index) => `b${index}`).join('\n');
		expect(() => diffLines(left, right)).toThrow('文本过大');
	});
});
