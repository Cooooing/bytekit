export const ipInfoReference = [
	{
		title: '数据来源',
		items: [
			{ syntax: 'CF-Connecting-IP', desc: 'Cloudflare 注入的当前访问者 IP 请求头。' },
			{ syntax: 'request.cf', desc: 'Cloudflare Worker 提供的入站请求元数据。' },
			{ syntax: 'colo', desc: '处理请求的 Cloudflare 数据中心代码。' },
		],
	},
	{
		title: '能力边界',
		items: [
			{ syntax: '当前访问 IP', desc: '可以查询当前请求的 IP 和 Cloudflare 元数据。' },
			{ syntax: '任意 IP', desc: '不支持输入任意 IP 查询归属地。' },
			{ syntax: '本地环境', desc: '本地开发环境通常没有 Cloudflare 请求信息。' },
		],
	},
	{
		title: '字段说明',
		items: [
			{ syntax: 'asn', desc: '自治系统编号。' },
			{ syntax: 'asOrganization', desc: '自治系统组织名称。' },
			{ syntax: 'latitude / longitude', desc: '网络定位坐标，可能为空或不精确。' },
			{ syntax: 'tlsVersion', desc: '客户端连接使用的 TLS 版本。' },
		],
	},
];
