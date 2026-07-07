import { describe, expect, it } from 'vitest';
import { jsonToCsv } from './csv/functions';
import { jsonToYaml, yamlToJson } from './yaml/functions';

describe('格式转换中的 JSON 数字精度', () => {
	it('JSON 转 CSV 时保留大整数文本', () => {
		const result = jsonToCsv('[{"account_id":2074073104153763841,"name":"A"}]');

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.output).toContain('2074073104153763841');
			expect(result.output).not.toContain('2074073104153763800');
		}
	});

	it('JSON 转 YAML 时将不安全数字作为字符串输出', () => {
		const result = jsonToYaml('{"account_id":2074073104153763841,"count":12}');

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.output).toContain("account_id: '2074073104153763841'");
			expect(result.output).toContain('count: 12');
		}
	});

	it('YAML 转 JSON 时不继续输出不安全 number', () => {
		const result = yamlToJson('account_id: 2074073104153763841');

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.output).toContain('"account_id": "');
		}
	});
});
