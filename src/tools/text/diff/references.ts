export const diffReference = [
	{
		title: '对比算法',
		items: [
			{ syntax: 'LCS', desc: '最长公共子序列， Myers 算法基础' },
			{ syntax: 'Myers', desc: 'Git 默认算法，O(ED) 时间复杂度' },
			{ syntax: 'Patience', desc: '处理大量重复行更优，突出有意义的变更' },
		],
	},
	{
		title: '输出格式',
		items: [
			{ syntax: '逐行对比', desc: '逐行逐字符比较，高亮差异部分' },
			{ syntax: '新增行', desc: '蓝色高亮，标记为 + ' },
			{ syntax: '删除行', desc: '红色高亮，标记为 - ' },
			{ syntax: '统计信息', desc: '显示相同/新增/删除行数' },
		],
	},
];
