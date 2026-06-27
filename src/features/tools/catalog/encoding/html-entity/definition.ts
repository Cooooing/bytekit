import type { ToolDefinition } from '../../types';

export const definition: ToolDefinition = {
	id: 'html-entity',
	href: 'tools/encoding/html-entity',
	name: 'HTML 实体编解码',
	shortName: 'HTML',
	description: 'HTML 实体编码和解码，处理 &amp; &lt; 等转义字符。',
	category: 'encoding',
	keywords: ['html', 'entity', 'encode', 'decode', '实体', '编码', '解码', '转义', 'escape', 'xss'],
};
