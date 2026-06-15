import yaml from 'js-yaml';

export type YamlResult =
	| { ok: true; output: string }
	| { ok: false; error: string };

export function jsonToYaml(input: string): YamlResult {
	const trimmed = input.trim();
	if (!trimmed) return { ok: false, error: '请输入 JSON 数据。' };

	try {
		const data = JSON.parse(trimmed);
		return { ok: true, output: yaml.dump(data, { indent: 2, lineWidth: -1 }) };
	} catch (error) {
		return { ok: false, error: error instanceof Error ? error.message : 'JSON 解析失败。' };
	}
}

export function yamlToJson(input: string): YamlResult {
	const trimmed = input.trim();
	if (!trimmed) return { ok: false, error: '请输入 YAML 数据。' };

	try {
		const data = yaml.load(trimmed);
		return { ok: true, output: JSON.stringify(data, null, 2) };
	} catch (error) {
		return { ok: false, error: error instanceof Error ? error.message : 'YAML 解析失败。' };
	}
}
