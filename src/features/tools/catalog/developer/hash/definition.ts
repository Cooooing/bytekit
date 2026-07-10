import type { ToolDefinition } from '../../types';

export const definition: ToolDefinition = {
	id: 'hash',
	href: 'tools/developer/hash',
	name: 'Hash 计算与校验',
	shortName: 'Hash',
	description: '计算文本和文件的 SHA、CRC32 摘要，并支持校验值比对。',
	category: 'developer',
	keywords: ['hash', 'sha', 'sha1', 'sha256', 'sha512', 'crc32', '哈希', '摘要', '校验', 'digest'],
};
