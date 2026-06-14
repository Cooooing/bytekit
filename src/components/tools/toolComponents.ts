import Base64Codec from './Base64Codec';
import JsonFormatter from './JsonFormatter';
import JwtDecoder from './JwtDecoder';
import PasswordGenerator from './PasswordGenerator';

export const toolComponents = {
	base64: Base64Codec,
	json: JsonFormatter,
	jwt: JwtDecoder,
	password: PasswordGenerator,
};

export type ToolComponentId = keyof typeof toolComponents;
