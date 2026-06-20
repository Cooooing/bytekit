export const colorPaletteReference = [
	{
		title: '调色板原理',
		items: [
			{ syntax: 'HSL', desc: '色相-饱和度-亮度模型' },
			{ syntax: '色相 (H)', desc: '0-360 度，决定颜色种类' },
			{ syntax: '饱和度 (S)', desc: '0-100%，颜色鲜艳程度' },
			{ syntax: '亮度 (L)', desc: '0-100%，颜色明暗程度' },
		],
	},
	{
		title: '生成规则',
		items: [
			{ syntax: '5 色', desc: '从浅到深，亮度递减' },
			{ syntax: '色相不变', desc: '保持基础色的色相' },
			{ syntax: '饱和度一致', desc: '所有颜色共享相同饱和度' },
		],
	},
];
