export const checksumReference = [
	{
		title: '输入模式',
		items: [
			{ syntax: 'Hex 字节', desc: '适合串口和设备报文，例如 01 03 00 00 00 02。' },
			{ syntax: '文本', desc: '按 UTF-8 字节计算，适合标准测试向量。' },
			{ syntax: '二进制字节', desc: '每 8 位组成一个字节，例如 00000001 00000011。' },
		],
	},
	{
		title: '常见 CRC16',
		items: [
			{ syntax: 'MODBUS', desc: '多项式 0x8005，初始值 0xFFFF，输入和输出反射。' },
			{ syntax: 'CCITT-FALSE', desc: '多项式 0x1021，初始值 0xFFFF，不反射。' },
			{ syntax: 'XMODEM', desc: '多项式 0x1021，初始值 0x0000，不反射。' },
			{ syntax: 'KERMIT', desc: '多项式 0x1021，初始值 0x0000，输入和输出反射。' },
			{ syntax: 'IBM-ARC', desc: '多项式 0x8005，初始值 0x0000，输入和输出反射。' },
			{ syntax: 'USB', desc: '多项式 0x8005，初始值 0xFFFF，结果异或 0xFFFF。' },
		],
	},
	{
		title: '字节序',
		items: [
			{ syntax: '高字节在前', desc: '也称大端序，例如 0x4B37 输出 4B 37。' },
			{ syntax: '低字节在前', desc: '也称小端序，Modbus RTU 常用，例如 0x4B37 输出 37 4B。' },
		],
	},
	{
		title: '测试向量',
		items: [
			{ syntax: '123456789 / CRC16-MODBUS', desc: '结果为 0x4B37。' },
			{ syntax: '123456789 / CRC16-CCITT-FALSE', desc: '结果为 0x29B1。' },
			{ syntax: '123456789 / CRC32', desc: '结果为 0xCBF43926。' },
		],
	},
];
