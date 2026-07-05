import protobuf from 'protobufjs';
import { createMockValue, type MockScalarKind } from '../../../shared/mockValues';

export interface ProtoMessageOption {
	name: string;
	fullName: string;
}

export interface JsonToProtoOptions {
	rootMessageName: string;
}

export interface ProtoJsonOptions {
	schema: string;
	messageName: string;
}

export type ToolResult<T> = { ok: true; result: T } | { ok: false; error: string };

type ProtoScalar =
	| 'double'
	| 'float'
	| 'int32'
	| 'int64'
	| 'uint32'
	| 'uint64'
	| 'sint32'
	| 'sint64'
	| 'fixed32'
	| 'fixed64'
	| 'sfixed32'
	| 'sfixed64'
	| 'bool'
	| 'string'
	| 'bytes';

type InferredValue =
	| { kind: 'scalar'; protoType: ProtoScalar }
	| { kind: 'message'; message: InferredMessage }
	| { kind: 'repeated'; element: InferredValue };

interface InferredField {
	protoName: string;
	optional: boolean;
	value: InferredValue;
	tag: number;
}

interface InferredMessage {
	name: string;
	fields: InferredField[];
}

interface GenerateContext {
	maxDepth: number;
	random: boolean;
}

const protoScalars = new Set<string>([
	'double',
	'float',
	'int32',
	'int64',
	'uint32',
	'uint64',
	'sint32',
	'sint64',
	'fixed32',
	'fixed64',
	'sfixed32',
	'sfixed64',
	'bool',
	'string',
	'bytes',
]);

const int32Max = 2147483647;
const int32Min = -2147483648;
const protoReservedWords = new Set([
	'bool',
	'bytes',
	'double',
	'enum',
	'extend',
	'extensions',
	'fixed32',
	'fixed64',
	'float',
	'import',
	'int32',
	'int64',
	'map',
	'message',
	'oneof',
	'optional',
	'package',
	'public',
	'repeated',
	'reserved',
	'returns',
	'rpc',
	'service',
	'string',
	'syntax',
	'uint32',
	'uint64',
]);

export const protoInputExample = `message UserProfile {
  string user_id = 1;
  string email = 2;
  string name = 3;
  optional int32 age = 4;
  repeated string tags = 5;
  map<string, int32> scores = 6;
  Address address = 7;
  oneof contact {
    string phone = 8;
    string backup_email = 9;
  }

  message Address {
    string city = 1;
    string street = 2;
    string zip_code = 3;
  }
}`;

export const jsonInputExample = `{
  "userId": "u_1001",
  "email": "user@example.com",
  "name": "张三",
  "age": 28,
  "tags": ["admin", "tester"],
  "scores": {
    "api": 98,
    "ui": 95
  },
  "address": {
    "city": "上海",
    "street": "世纪大道",
    "zipCode": "200120"
  }
}`;

export function listProtoMessages(schema: string): ToolResult<ProtoMessageOption[]> {
	const parsed = parseProtoSchema(schema);
	if (!parsed.ok) return parsed;
	const messages: ProtoMessageOption[] = [];
	visitNamespace(parsed.result.root, (object) => {
		if (object instanceof protobuf.Type) {
			messages.push({
				name: object.name,
				fullName: trimLeadingDot(object.fullName),
			});
		}
	});
	if (messages.length === 0) return { ok: false, error: '未找到 message 定义。' };
	return { ok: true, result: messages };
}

export function protoToJsonSample(options: ProtoJsonOptions): ToolResult<string> {
	const typeResult = lookupMessage(options.schema, options.messageName);
	if (!typeResult.ok) return typeResult;
	const value = generateMessageSample(typeResult.result, { maxDepth: 8, random: false }, 0, []);
	return { ok: true, result: JSON.stringify(value, null, 2) };
}

export function protoToRandomJsonSample(options: ProtoJsonOptions): ToolResult<string> {
	const typeResult = lookupMessage(options.schema, options.messageName);
	if (!typeResult.ok) return typeResult;
	const value = generateMessageSample(typeResult.result, { maxDepth: 8, random: true }, 0, []);
	return { ok: true, result: JSON.stringify(value, null, 2) };
}

export function jsonSampleToProto(input: string, options: JsonToProtoOptions): ToolResult<string> {
	if (input.trim() === '') return { ok: false, error: '请输入 JSON 样例。' };
	const rootName = toMessageName(options.rootMessageName || 'RootMessage');
	if (!isProtoMessageName(rootName)) return { ok: false, error: 'message 名称必须是合法的标识符。' };

	let parsed: unknown;
	try {
		parsed = JSON.parse(input);
	} catch (error) {
		return { ok: false, error: `JSON 解析失败：${error instanceof Error ? error.message : '格式不合法。'}` };
	}

	const samples = normalizeRootSamples(parsed);
	if (!samples.ok) return samples;
	return { ok: true, result: renderMessage(buildMessage(samples.result, rootName), 0) };
}

function parseProtoSchema(schema: string): ToolResult<{ root: protobuf.Root }> {
	if (schema.trim() === '') return { ok: false, error: '请输入 proto message。' };
	try {
		const normalizedSchema = /^\s*syntax\s*=/.test(schema) ? schema : `syntax = "proto3";\n${schema}`;
		const parsed = protobuf.parse(normalizedSchema, { keepCase: true });
		parsed.root.resolveAll();
		return { ok: true, result: { root: parsed.root } };
	} catch (error) {
		return { ok: false, error: `Proto 解析失败：${error instanceof Error ? error.message : '格式不合法。'}` };
	}
}

function lookupMessage(schema: string, messageName: string): ToolResult<protobuf.Type> {
	const parsed = parseProtoSchema(schema);
	if (!parsed.ok) return parsed;
	const normalizedName = trimLeadingDot(messageName);
	if (!normalizedName) return { ok: false, error: '请选择 message。' };
	try {
		return { ok: true, result: parsed.result.root.lookupType(normalizedName) };
	} catch {
		return { ok: false, error: `未找到 message：${messageName}` };
	}
}

function visitNamespace(namespace: protobuf.ReflectionObject, visitor: (object: protobuf.ReflectionObject) => void) {
	const nested = getNestedArray(namespace);
	for (const object of nested) {
		visitor(object);
		visitNamespace(object, visitor);
	}
}

function getNestedArray(object: protobuf.ReflectionObject): protobuf.ReflectionObject[] {
	const holder = object as protobuf.ReflectionObject & { nestedArray?: protobuf.ReflectionObject[] };
	return holder.nestedArray ?? [];
}

function normalizeRootSamples(value: unknown): ToolResult<Record<string, unknown>[]> {
	if (Array.isArray(value)) {
		if (value.length === 0) return { ok: false, error: 'JSON 数组至少需要一个对象元素。' };
		if (!value.every(isPlainObject)) return { ok: false, error: 'JSON 数组只能包含对象元素。' };
		return { ok: true, result: value };
	}
	if (!isPlainObject(value)) return { ok: false, error: 'JSON 根节点必须是对象或对象数组。' };
	return { ok: true, result: [value] };
}

function buildMessage(samples: Record<string, unknown>[], name: string): InferredMessage {
	const fieldNames = new Set<string>();
	for (const sample of samples) {
		for (const key of Object.keys(sample)) fieldNames.add(key);
	}

	const fields: InferredField[] = [];
	let tag = 1;
	for (const originalName of fieldNames) {
		const values: unknown[] = [];
		let missing = false;
		for (const sample of samples) {
			if (Object.prototype.hasOwnProperty.call(sample, originalName)) values.push(sample[originalName]);
			else missing = true;
		}
		fields.push({
			protoName: toFieldName(originalName),
			optional: missing || values.some((value) => value === null),
			value: inferValue(values, toMessageName(originalName)),
			tag,
		});
		tag += 1;
	}

	return { name, fields };
}

function inferValue(values: unknown[], messageName: string): InferredValue {
	const nonNull = values.filter((value) => value !== null && value !== undefined);
	if (nonNull.length === 0) return { kind: 'scalar', protoType: 'string' };

	if (nonNull.every(Array.isArray)) {
		const elements = nonNull.flatMap((value) => value as unknown[]).filter((value) => value !== null && value !== undefined);
		return { kind: 'repeated', element: inferValue(elements.length === 0 ? [''] : elements, messageName.replace(/List$/, '') || 'Item') };
	}

	if (nonNull.every(isPlainObject)) {
		return { kind: 'message', message: buildMessage(nonNull as Record<string, unknown>[], messageName) };
	}

	if (nonNull.every((value) => typeof value === 'boolean')) return { kind: 'scalar', protoType: 'bool' };
	if (nonNull.every((value) => typeof value === 'string')) return { kind: 'scalar', protoType: 'string' };
	if (nonNull.every((value) => typeof value === 'number' && Number.isFinite(value))) {
		const numbers = nonNull as number[];
		if (numbers.some((value) => !Number.isInteger(value))) return { kind: 'scalar', protoType: 'double' };
		if (numbers.some((value) => value > int32Max || value < int32Min)) return { kind: 'scalar', protoType: 'int64' };
		return { kind: 'scalar', protoType: 'int32' };
	}

	return { kind: 'scalar', protoType: 'string' };
}

function renderMessage(message: InferredMessage, depth: number): string {
	const pad = indent(depth);
	const fieldPad = indent(depth + 1);
	const lines = [`${pad}message ${message.name} {`];
	for (const field of message.fields) {
		lines.push(`${fieldPad}${renderField(field)}`);
	}

	const nestedMessages = collectNestedMessages(message);
	if (nestedMessages.length > 0 && message.fields.length > 0) lines.push('');
	for (const nested of nestedMessages) {
		lines.push(renderMessage(nested, depth + 1));
	}

	lines.push(`${pad}}`);
	return lines.join('\n');
}

function renderField(field: InferredField): string {
	const label = field.optional && field.value.kind === 'scalar' ? 'optional ' : '';
	if (field.value.kind === 'scalar') return `${label}${field.value.protoType} ${field.protoName} = ${field.tag};`;
	if (field.value.kind === 'message') return `${field.value.message.name} ${field.protoName} = ${field.tag};`;
	return `repeated ${renderValueType(field.value.element)} ${field.protoName} = ${field.tag};`;
}

function renderValueType(value: InferredValue): string {
	if (value.kind === 'scalar') return value.protoType;
	if (value.kind === 'message') return value.message.name;
	return 'string';
}

function collectNestedMessages(message: InferredMessage): InferredMessage[] {
	const nested: InferredMessage[] = [];
	for (const field of message.fields) {
		if (field.value.kind === 'message') nested.push(field.value.message);
		if (field.value.kind === 'repeated' && field.value.element.kind === 'message') nested.push(field.value.element.message);
	}
	return nested;
}

function generateMessageSample(type: protobuf.Type, context: GenerateContext, depth: number, stack: string[]): Record<string, unknown> {
	if (depth >= context.maxDepth || stack.includes(type.fullName)) return {};

	const output: Record<string, unknown> = {};
	const oneofChoices = chooseOneofFields(type, context);
	for (const field of type.fieldsArray) {
		if (field.partOf && oneofChoices.get(field.partOf.name) !== field.name) continue;
		output[toJsonFieldName(field)] = generateFieldValue(field, context, depth, [...stack, type.fullName]);
	}
	return output;
}

function chooseOneofFields(type: protobuf.Type, context: GenerateContext): Map<string, string> {
	const result = new Map<string, string>();
	const oneofs = (type as protobuf.Type & { oneofsArray?: Array<{ name: string; oneof: string[] }> }).oneofsArray ?? [];
	for (const oneof of oneofs) {
		if (oneof.oneof.length > 0) {
			const index = context.random ? randomInt(0, oneof.oneof.length - 1) : 0;
			result.set(oneof.name, oneof.oneof[index]);
		}
	}
	return result;
}

function generateFieldValue(field: protobuf.Field, context: GenerateContext, depth: number, stack: string[]): unknown {
	if (field.map) {
		return { [mapKey(field)]: generateSingleValue(field, context, depth, stack) };
	}
	if (field.repeated) {
		return [generateSingleValue(field, context, depth, stack)];
	}
	return generateSingleValue(field, context, depth, stack);
}

function generateSingleValue(field: protobuf.Field, context: GenerateContext, depth: number, stack: string[]): unknown {
	if (protoScalars.has(field.type)) return scalarValue(field.type as ProtoScalar, field.name, context);
	const resolved = field.resolvedType;
	if (resolved instanceof protobuf.Enum) return enumValue(resolved);
	if (resolved instanceof protobuf.Type) return generateMessageSample(resolved, context, depth + 1, stack);
	return null;
}

function scalarValue(type: ProtoScalar, fieldName: string, context: GenerateContext): unknown {
	return createMockValue({
		fieldName,
		kind: scalarKind(type),
		random: context.random,
	});
}

function scalarKind(type: ProtoScalar): MockScalarKind {
	if (type === 'string') return 'string';
	if (type === 'bool') return 'boolean';
	if (type === 'double' || type === 'float') return 'float';
	if (type === 'bytes') return 'bytes';
	if (type === 'uint64' || type === 'fixed64') return 'uint64';
	if (type === 'int64' || type === 'sint64' || type === 'sfixed64') return 'int64';
	if (type === 'uint32' || type === 'fixed32') return 'unsignedInteger';
	return 'integer';
}

function enumValue(type: protobuf.Enum): string {
	const entries = Object.entries(type.values);
	if (entries.length === 0) return '';
	return (entries.find(([, value]) => value !== 0) ?? entries[0])[0];
}

function mapKey(field: protobuf.Field): string {
	if (field.keyType === 'int32' || field.keyType === 'uint32' || field.keyType === 'sint32' || field.keyType === 'fixed32' || field.keyType === 'sfixed32') {
		return '1';
	}
	if (field.keyType === 'bool') return 'true';
	return 'key_1';
}

function toJsonFieldName(field: protobuf.Field): string {
	const jsonName = (field.options as Record<string, unknown> | undefined)?.json_name;
	if (typeof jsonName === 'string' && jsonName) return jsonName;
	return snakeToCamel(field.name);
}

function snakeToCamel(value: string): string {
	return value.replace(/_([a-zA-Z0-9])/g, (_, char: string) => char.toUpperCase());
}

function toFieldName(value: string): string {
	const normalized = value
		.replace(/([a-z0-9])([A-Z])/g, '$1_$2')
		.replace(/[^a-zA-Z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '')
		.toLowerCase();
	const fallback = normalized || 'field';
	const prefixed = /^[a-zA-Z_]/.test(fallback) ? fallback : `field_${fallback}`;
	return protoReservedWords.has(prefixed) ? `${prefixed}_field` : prefixed;
}

function toMessageName(value: string): string {
	const words = value
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.split(/[^a-zA-Z0-9]+/)
		.filter(Boolean);
	const name = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('') || 'RootMessage';
	return /^[A-Za-z_]/.test(name) ? name : `Message${name}`;
}

function isProtoMessageName(value: string): boolean {
	return /^[A-Za-z_][A-Za-z0-9_]*$/.test(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function indent(depth: number): string {
	return '  '.repeat(depth);
}

function trimLeadingDot(value: string): string {
	return value.replace(/^\./, '');
}

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
