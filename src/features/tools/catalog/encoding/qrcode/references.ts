export const qrcodeReference = [
	{
		title: '内容模板',
		items: [
			{ syntax: '文本', desc: '直接编码输入内容。' },
			{ syntax: 'URL', desc: '仅接受 http 和 https 链接。' },
			{ syntax: 'Wi-Fi', desc: '生成 WIFI:T:... 格式，手机扫码可连接网络。' },
			{ syntax: '联系人', desc: '生成 vCard 3.0 内容。' },
		],
	},
	{
		title: '纠错等级',
		items: [
			{ syntax: 'L', desc: '容量最大，纠错能力最低。' },
			{ syntax: 'M', desc: '常用默认值。' },
			{ syntax: 'Q / H', desc: '纠错能力更强，图案会更密。' },
		],
	},
	{
		title: '导出',
		items: [
			{ syntax: 'PNG', desc: '适合直接使用和分享。' },
			{ syntax: 'SVG', desc: '适合在网页和设计稿中继续编辑。' },
			{ syntax: '解析图片', desc: '在浏览器本地读取图片，不上传。' },
		],
	},
];
