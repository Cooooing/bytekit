export const ipInfoReference = [
	{
		title: '数据来源',
		items: [
			{ syntax: 'Cloudflare', desc: '读取 CF-Connecting-IP 请求头和 Worker request.cf 元数据。' },
			{ syntax: 'Vercel', desc: '读取 x-forwarded-for 与 x-vercel-ip-* 请求头。' },
			{ syntax: '通用服务端', desc: '尽量读取 x-forwarded-for、x-real-ip 或 Forwarded 请求头。' },
		],
	},
	{
		title: '能力边界',
		items: [
			{ syntax: '当前访问 IP', desc: '可以查询当前请求在部署平台中可见的 IP。' },
			{ syntax: '任意 IP', desc: '不支持输入任意 IP 查询归属地。' },
			{ syntax: 'GitHub Pages', desc: '纯静态部署没有后端请求上下文，通常不可用。' },
		],
	},
	{
		title: '字段说明',
		items: [
			{ syntax: 'ASN', desc: '自治系统编号，仅平台提供时显示。' },
			{ syntax: 'colo', desc: 'Cloudflare 数据中心代码，仅 Cloudflare 环境显示。' },
			{ syntax: 'latitude / longitude', desc: '平台提供的网络定位坐标，可能为空或不精确。' },
			{ syntax: 'TLS', desc: '连接加密信息，仅平台提供时显示。' },
		],
	},
];
