import Base64Codec from './Base64Codec';
import ColorConverter from './ColorConverter';
import HashGenerator from './HashGenerator';
import JsonFormatter from './JsonFormatter';
import JwtDecoder from './JwtDecoder';
import PasswordGenerator from './PasswordGenerator';
import TimestampConverter from './TimestampConverter';
import UrlCodec from './UrlCodec';
import UuidGenerator from './UuidGenerator';

export const toolComponents = {
	base64: Base64Codec,
	color: ColorConverter,
	hash: HashGenerator,
	json: JsonFormatter,
	jwt: JwtDecoder,
	password: PasswordGenerator,
	timestamp: TimestampConverter,
	url: UrlCodec,
	uuid: UuidGenerator,
};

export type ToolComponentId = keyof typeof toolComponents;
