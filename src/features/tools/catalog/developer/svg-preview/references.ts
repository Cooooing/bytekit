export const svgPreviewReference = [
	{
		title: 'SVG 源码',
		items: [
			{ syntax: '<svg>', desc: 'SVG 的根元素。建议设置 viewBox 以便自适应缩放。' },
			{ syntax: 'viewBox="0 0 24 24"', desc: '定义内部坐标系和可视区域。' },
			{ syntax: '<path d="..." />', desc: '使用路径绘制图标、曲线和复杂形状。' },
		],
	},
	{
		title: '预览说明',
		items: [
			{ syntax: '缩放', desc: '只改变预览画布，不修改 SVG 源码。' },
			{ syntax: '隔离画布', desc: 'SVG 在 sandbox iframe 中预览，脚本不会在工具页面执行。' },
			{ syntax: '下载', desc: '下载当前编辑器内的 SVG 源码。' },
		],
	},
];
