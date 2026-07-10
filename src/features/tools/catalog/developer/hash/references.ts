export const hashReference = [
	{
		title: '算法定位',
		items: [
			{ syntax: 'SHA-256', desc: '常用文件完整性校验算法，默认推荐使用。' },
			{ syntax: 'SHA-512', desc: '输出更长，适合需要更高强度摘要的场景。' },
			{ syntax: 'SHA-1', desc: '已不适合安全场景，仅建议用于旧系统兼容。' },
			{ syntax: 'CRC32', desc: '常见于压缩包和传输损坏检查，不是安全 Hash。' },
		],
	},
	{
		title: '文件校验',
		items: [
			{ syntax: '本地计算', desc: '文件在浏览器中分片读取，不上传到服务器。' },
			{ syntax: '期望 Hash', desc: '粘贴发布方提供的校验值后，工具会和当前结果比对。' },
			{ syntax: '大小写/空白', desc: '校验时忽略大小写、空格和换行。' },
			{ syntax: '算法前缀', desc: '支持 sha256:、SHA-256、crc32: 等常见写法。' },
		],
	},
	{
		title: '边界说明',
		items: [
			{ syntax: '完整性', desc: 'Hash 一致只能说明内容没有变化，不能证明来源可信。' },
			{ syntax: '数字签名', desc: '验证发布者身份需要签名或可信下载渠道。' },
			{ syntax: '恢复卷', desc: 'PAR2、RAR 恢复卷可以修复部分损坏，不属于普通 Hash 校验。' },
			{ syntax: '密码存储', desc: '密码应使用 bcrypt、scrypt、Argon2，不应直接使用 SHA。' },
		],
	},
];
