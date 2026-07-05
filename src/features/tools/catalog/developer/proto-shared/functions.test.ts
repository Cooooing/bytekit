import { afterEach, describe, expect, it, vi } from 'vitest';
import { jsonSampleToProto, listProtoMessages, protoToJsonSample, protoToRandomJsonSample } from './functions';

const schema = `message User {
  string user_id = 1;
  string email = 2;
  string name = 3;
  optional int32 age = 4;
  repeated string tags = 5;
  map<string, int32> scores = 6;
  Status status = 7;
  Address address = 8;
  oneof contact {
    string phone = 9;
    string backup_email = 10;
  }

  enum Status {
    STATUS_UNSPECIFIED = 0;
    ACTIVE = 1;
  }

  message Address {
    string city = 1;
    string zip_code = 2;
  }
}

message AuditLog {
  string id = 1;
}`;

describe('Proto / JSON 共享转换函数', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('根据 JSON 对象生成纯 message', () => {
		const result = jsonSampleToProto(
			`{
  "userId": "u_1",
  "age": 28,
  "enabled": true,
  "score": 98.5,
  "address": { "city": "上海", "zipCode": "200120" },
  "tags": ["admin", "tester"]
}`,
			{ rootMessageName: 'ApiUser' },
		);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.result.startsWith('message ApiUser')).toBe(true);
			expect(result.result).not.toContain('syntax =');
			expect(result.result).not.toContain('package ');
			expect(result.result).toContain('string user_id = 1;');
			expect(result.result).toContain('int32 age = 2;');
			expect(result.result).toContain('bool enabled = 3;');
			expect(result.result).toContain('double score = 4;');
			expect(result.result).toContain('Address address = 5;');
			expect(result.result).toContain('repeated string tags = 6;');
			expect(result.result).toContain('message Address');
			expect(result.result).toContain('string zip_code = 2;');
		}
	});

	it('根据 JSON 对象数组合并字段并推断 optional', () => {
		const result = jsonSampleToProto('[{"id":1,"name":"a"},{"id":2,"age":null},{"id":3000000000,"age":18}]', {
			rootMessageName: 'RootMessage',
		});
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.result).toContain('int64 id = 1;');
			expect(result.result).toContain('optional string name = 2;');
			expect(result.result).toContain('optional int32 age = 3;');
		}
	});

	it('将普通对象固定生成为嵌套 message', () => {
		const result = jsonSampleToProto('{"scores":{"api":98,"ui":95}}', {
			rootMessageName: 'ScoreResult',
		});
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.result).toContain('Scores scores = 1;');
			expect(result.result).toContain('message Scores');
			expect(result.result).not.toContain('map<string');
		}
	});

	it('解析多个 message 并按选中项生成 JSON 样例', () => {
		const messages = listProtoMessages(schema);
		expect(messages.ok).toBe(true);
		if (messages.ok) {
			expect(messages.result.map((item) => item.fullName)).toEqual(expect.arrayContaining(['User', 'User.Address', 'AuditLog']));
		}

		const result = protoToJsonSample({ schema, messageName: 'User' });
		expect(result.ok).toBe(true);
		if (result.ok) {
			const json = JSON.parse(result.result);
			expect(json.userId).toBe('id_001');
			expect(json.email).toBe('user001@example.com');
			expect(json.name).toBe('测试用户001');
			expect(json.tags).toEqual(['示例文本']);
			expect(json.scores).toEqual({ key_1: 90 });
			expect(json.status).toBe('ACTIVE');
			expect(json.address).toMatchObject({ city: '北京', zipCode: '100000' });
			expect(json.phone).toBe('13800138000');
			expect(json.backupEmail).toBeUndefined();
		}
	});

	it('支持按 message 随机填充 JSON value', () => {
		const values = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
		let index = 0;
		vi.spyOn(Math, 'random').mockImplementation(() => {
			const value = values[index % values.length];
			index += 1;
			return value;
		});

		const first = protoToRandomJsonSample({ schema, messageName: 'User' });
		const second = protoToRandomJsonSample({ schema, messageName: 'User' });
		expect(first.ok).toBe(true);
		expect(second.ok).toBe(true);
		if (first.ok && second.ok) {
			const firstJson = JSON.parse(first.result);
			const secondJson = JSON.parse(second.result);
			expect(firstJson.userId).toMatch(/^id_\d{4}$/);
			expect(firstJson.email).toMatch(/^user\d{4}@example\.com$/);
			expect(firstJson.name).toMatch(/^测试用户\d{4}$/);
			expect(firstJson.age).toBeGreaterThanOrEqual(18);
			expect(firstJson.age).toBeLessThanOrEqual(80);
			expect(firstJson.phone).toMatch(/^138\d{8}$/);
			expect(first.result).not.toBe(second.result);
			expect(secondJson.tags).toHaveLength(1);
		}
	});

	it('返回常见错误', () => {
		expect(listProtoMessages('').ok).toBe(false);
		expect(protoToJsonSample({ schema: 'message {', messageName: 'A' }).ok).toBe(false);
		expect(jsonSampleToProto('', { rootMessageName: 'RootMessage' }).ok).toBe(false);
		expect(jsonSampleToProto('[]', { rootMessageName: 'RootMessage' }).ok).toBe(false);
		expect(jsonSampleToProto('[1]', { rootMessageName: 'RootMessage' }).ok).toBe(false);
	});
});
