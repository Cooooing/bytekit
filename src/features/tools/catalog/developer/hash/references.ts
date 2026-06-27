export const hashReference = [
	{
		title: '算法对比',
		items: [
			{ syntax: 'SHA-1', desc: '160 位，已不安全，仅用于校验' },
			{ syntax: 'SHA-256', desc: '256 位，最常用，比特币使用' },
			{ syntax: 'SHA-384', desc: '384 位，SHA-512 的截断版' },
			{ syntax: 'SHA-512', desc: '512 位，最高安全性' },
		],
	},
	{
		title: '使用场景',
		items: [
			{ syntax: '密码存储', desc: '用 bcrypt/argon2，不要直接用 SHA' },
			{ syntax: '文件校验', desc: 'SHA-256 或 SHA-512 验证完整性' },
			{ syntax: '数字签名', desc: 'SHA-256 + RSA/ECDSA' },
			{ syntax: 'HMAC', desc: 'SHA-256 + 密钥，用于消息认证' },
		],
	},
];
