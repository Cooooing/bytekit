export const jwtReference = [
	{
		title: 'JWT 结构',
		items: [
			{ syntax: 'Header', desc: '{"alg":"HS256","typ":"JWT"} 算法和类型' },
			{ syntax: 'Payload', desc: '声明（claims）：iss, sub, exp, iat 等' },
			{ syntax: 'Signature', desc: '对 header.payload 的签名，可选' },
		],
	},
	{
		title: '常见算法',
		items: [
			{ syntax: 'HS256', desc: 'HMAC + SHA-256，对称密钥' },
			{ syntax: 'RS256', desc: 'RSA + SHA-256，非对称密钥' },
			{ syntax: 'ES256', desc: 'ECDSA + SHA-256，椭圆曲线' },
			{ syntax: 'none', desc: '无签名（不安全，仅调试用）' },
		],
	},
	{
		title: '常用 Claims',
		items: [
			{ syntax: 'iss', desc: '签发者' },
			{ syntax: 'sub', desc: '主题/用户ID' },
			{ syntax: 'exp', desc: '过期时间（Unix 时间戳）' },
			{ syntax: 'iat', desc: '签发时间' },
			{ syntax: 'nbf', desc: '生效时间' },
		],
	},
];
