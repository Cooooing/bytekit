export const ipNetworkReference = [
	{
		title: 'CIDR',
		items: [
			{ syntax: '192.168.1.10/24', desc: 'IPv4 地址加前缀长度，表示一个子网。' },
			{ syntax: '/31', desc: '常用于点对点链路，两个地址都可使用。' },
			{ syntax: '/32', desc: '表示单个 IPv4 地址。' },
		],
	},
	{
		title: '常用私有地址',
		items: [
			{ syntax: '10.0.0.0/8', desc: '大型内网地址段。' },
			{ syntax: '172.16.0.0/12', desc: '172.16.0.0 到 172.31.255.255。' },
			{ syntax: '192.168.0.0/16', desc: '常见家庭和办公内网地址段。' },
		],
	},
	{
		title: '特殊地址',
		items: [
			{ syntax: '127.0.0.0/8', desc: '本机回环地址。' },
			{ syntax: '169.254.0.0/16', desc: 'IPv4 链路本地地址。' },
			{ syntax: '224.0.0.0/4', desc: 'IPv4 组播地址。' },
			{ syntax: '2001:db8::/32', desc: 'IPv6 文档示例地址。' },
		],
	},
	{
		title: '掩码',
		items: [
			{ syntax: '255.255.255.0', desc: '等价于 /24。' },
			{ syntax: '0.0.0.255', desc: '反掩码，常用于 ACL。' },
			{ syntax: '255.255.0.0', desc: '等价于 /16。' },
		],
	},
];
