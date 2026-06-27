export const cssUnitReference = [
	{
		title: 'CSS 单位',
		items: [
			{ syntax: 'px', desc: '绝对像素，最常用的单位' },
			{ syntax: 'rem', desc: '相对于根元素 font-size（默认 16px）' },
			{ syntax: 'em', desc: '相对于父元素 font-size' },
			{ syntax: 'vw', desc: '视窗宽度的 1%' },
			{ syntax: 'vh', desc: '视窗高度的 1%' },
			{ syntax: '%', desc: '相对于父元素宽度' },
		],
	},
	{
		title: '换算公式',
		items: [
			{ syntax: 'rem → px', desc: '值 × 根字体大小（默认 16px）' },
			{ syntax: 'em → px', desc: '值 × 父元素 font-size' },
			{ syntax: 'vw → px', desc: '值 ÷ 100 × 视窗宽度' },
		],
	},
];
