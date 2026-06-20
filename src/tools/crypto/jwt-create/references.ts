export const jwtCreateReference = [
	{
		title: 'JWT 结构',
		items: [
			{ syntax: 'Header', desc: '算法和令牌类型（如 {"alg":"HS256","typ":"JWT"}）' },
			{ syntax: 'Payload', desc: '声明信息（如 {"sub":"123","name":"test"}）' },
			{ syntax: 'Signature', desc: '签名（可选密钥）' },
		],
	},
	{
		title: '常用 Header',
		items: [
			{ syntax: '{"alg":"HS256","typ":"JWT"}', desc: 'HMAC-SHA256 签名' },
			{ syntax: '{"alg":"none","typ":"JWT"}', desc: '无签名（仅测试）' },
		],
	},
];
