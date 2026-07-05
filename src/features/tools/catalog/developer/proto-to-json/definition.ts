import type { ToolDefinition } from '../../types';

export const definition: ToolDefinition = {
	id: 'proto-to-json',
	href: 'tools/developer/proto-to-json',
	name: 'Proto 转 JSON',
	shortName: 'Proto→JSON',
	description: '解析 proto message，并生成对应的 JSON 样例。',
	category: 'developer',
	keywords: ['proto', 'protobuf', 'json', 'message', 'schema', '接口测试', '样例', '转换'],
};
