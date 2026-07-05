import type { ToolDefinition } from '../../types';

export const definition: ToolDefinition = {
	id: 'json-to-proto',
	href: 'tools/developer/json-to-proto',
	name: 'JSON 转 Proto',
	shortName: 'JSON→Proto',
	description: '根据 JSON 对象或对象数组推断并生成 proto message。',
	category: 'developer',
	keywords: ['json', 'proto', 'protobuf', 'message', 'schema', '接口测试', '样例', '转换'],
};
