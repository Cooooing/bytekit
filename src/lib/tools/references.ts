export const jsonReference = [
	{
		title: 'JSON 语法',
		items: [
			{ syntax: '{ }', desc: '对象，键值对用逗号分隔' },
			{ syntax: '[ ]', desc: '数组，值用逗号分隔' },
			{ syntax: '"str"', desc: '字符串必须用双引号' },
			{ syntax: 'null', desc: '空值' },
			{ syntax: 'true/false', desc: '布尔值' },
			{ syntax: '//注释', desc: 'JSON 不支持注释（会被拒绝）' },
		],
	},
	{
		title: '常见错误',
		items: [
			{ syntax: '单引号', desc: "JSON 只允许双引号，'key' 无效" },
			{ syntax: '尾逗号', desc: '{"a":1,} 是无效 JSON' },
			{ syntax: '注释', desc: '标准 JSON 不允许注释' },
			{ syntax: '无引号键', desc: '{key:"val"} 必须写成 {"key":"val"}' },
		],
	},
];

export const base64Reference = [
	{
		title: 'Base64 说明',
		items: [
			{ syntax: '编码', desc: '将二进制数据转为 64 个可打印 ASCII 字符' },
			{ syntax: '字符集', desc: 'A-Z a-z 0-9 + / (填充用 =)' },
			{ syntax: '膨胀率', desc: '编码后体积增大约 33%' },
			{ syntax: '用途', desc: '邮件附件、Data URL、HTTP Basic Auth' },
		],
	},
	{
		title: '变体',
		items: [
			{ syntax: '标准', desc: '使用 + / 和 = 填充' },
			{ syntax: 'URL-safe', desc: '用 - _ 代替 + /，无填充' },
			{ syntax: 'MIME', desc: '每 76 字符换行' },
		],
	},
];

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

export const timestampReference = [
	{
		title: '时间格式',
		items: [
			{ syntax: 'Unix 秒', desc: '1970-01-01 起的秒数，10 位数字' },
			{ syntax: 'Unix 毫秒', desc: '13 位数字' },
			{ syntax: 'ISO 8601', desc: '2024-01-15T08:30:00.000Z' },
			{ syntax: 'RFC 2822', desc: 'Mon, 15 Jan 2024 08:30:00 GMT' },
		],
	},
	{
		title: '常见时间戳',
		items: [
			{ syntax: '0', desc: '1970-01-01 00:00:00 UTC' },
			{ syntax: '1000000000', desc: '2001-09-09 01:46:40 UTC' },
			{ syntax: '1700000000', desc: '2023-11-14 22:13:20 UTC' },
		],
	},
];

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

export const colorReference = [
	{
		title: '颜色格式',
		items: [
			{ syntax: 'HEX', desc: '#FF5733（6位）或 #F53（3位缩写）' },
			{ syntax: 'RGB', desc: 'rgb(255, 87, 51) 取值 0-255' },
			{ syntax: 'HSL', desc: 'hsl(14, 100%, 60%) 色相0-360 饱和度/亮度0-100%' },
			{ syntax: 'RGBA', desc: '带透明度：rgba(255,87,51,0.5)' },
		],
	},
	{
		title: '常用色值',
		items: [
			{ syntax: '#000000', desc: '黑色' },
			{ syntax: '#FFFFFF', desc: '白色' },
			{ syntax: '#FF0000', desc: '红色' },
			{ syntax: '#00FF00', desc: '绿色' },
			{ syntax: '#0000FF', desc: '蓝色' },
		],
	},
];

export const cssReference = [
	{
		title: 'CSS 压缩规则',
		items: [
			{ syntax: '空白', desc: '移除多余空格、换行、缩进' },
			{ syntax: '注释', desc: '移除 /* ... */ 注释' },
			{ syntax: '分号', desc: '最后一个声明后的分号可省略' },
			{ syntax: '0 值', desc: '0px → 0（除角度和时间单位外）' },
		],
	},
	{
		title: '最佳实践',
		items: [
			{ syntax: '变量', desc: '使用 CSS 自定义属性 --var 管理主题' },
			{ syntax: '简写', desc: 'margin: 10px 20px 代替 margin-top 等' },
			{ syntax: '选择器', desc: '避免过深嵌套（>3层影响性能）' },
		],
	},
];
