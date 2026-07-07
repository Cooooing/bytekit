import yaml from 'js-yaml';
import { fail, ok, requireTrimmedInput } from '../result';
import { parseJsonLossless, stringifyJsonLossless, toPlainJsonValue } from '../../../shared/losslessJson';

export type YamlResult =
	| { ok: true; output: string }
	| { ok: false; error: string };

export function jsonToYaml(input: string): YamlResult {
	const trimmed = requireTrimmedInput(input, '请输入 JSON 数据。');
	if (typeof trimmed !== 'string') return trimmed;

	try {
		const data = parseJsonLossless(trimmed);
		return ok(yaml.dump(toPlainJsonValue(data), { indent: 2, lineWidth: -1 }));
	} catch (error) {
		return fail(error instanceof Error ? error.message : 'JSON 解析失败。');
	}
}

export function yamlToJson(input: string): YamlResult {
	const trimmed = requireTrimmedInput(input, '请输入 YAML 数据。');
	if (typeof trimmed !== 'string') return trimmed;

	try {
		const data = yaml.load(trimmed);
		return ok(stringifyJsonLossless(toPlainJsonValue(data), 2));
	} catch (error) {
		return fail(error instanceof Error ? error.message : 'YAML 解析失败。');
	}
}
