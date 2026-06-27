import type { ToolDefinition } from '../../types';

export const definition: ToolDefinition = {
	id: 'checksum',
	href: 'tools/developer/checksum',
	name: '校验码计算器',
	shortName: 'Checksum',
	description: '计算 CRC16、CRC32、CRC8、LRC 和 BCC 校验码。',
	category: 'developer',
	keywords: ['checksum', 'crc', 'crc16', 'crc32', 'crc8', 'modbus', 'lrc', 'bcc', 'xor', '校验码', '循环冗余校验'],
};
