export const urlReference = [
	{
		title: 'URL 编码规则',
		items: [
			{ syntax: '保留字符', desc: ': / ? # [ ] @ ! $ & \' ( ) * + , ; =' },
			{ syntax: '编码方式', desc: '非 ASCII 和特殊字符转为 %XX 格式' },
			{ syntax: '空格', desc: '编码为 %20 或 +' },
			{ syntax: '中文', desc: 'UTF-8 字节逐个编码：%E4%BD%A0' },
		],
	},
	{
		title: 'URL 组件',
		items: [
			{ syntax: '协议', desc: 'https: / http: / ftp:' },
			{ syntax: '主机', desc: 'example.com 或 192.168.1.1' },
			{ syntax: '端口', desc: ':8080（可选）' },
			{ syntax: '路径', desc: '/path/to/resource' },
			{ syntax: '查询', desc: '?key=value&key2=value2' },
			{ syntax: '哈希', desc: '#section（客户端使用）' },
		],
	},
];
