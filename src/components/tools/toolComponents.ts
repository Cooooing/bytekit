import Base64Codec from './encoding/Base64Codec';
import CaseConverter from './text/CaseConverter';
import ColorConverter from './text/ColorConverter';
import CssMinify from './css/CssMinify';
import CsvConverter from './format/CsvConverter';
import DiffViewer from './text/DiffViewer';
import HashGenerator from './developer/HashGenerator';
import JsonFormatter from './json/JsonFormatter';
import JwtDecoder from './crypto/JwtDecoder';
import MarkdownPreview from './text/MarkdownPreview';
import PasswordGenerator from './crypto/PasswordGenerator';
import RegexTester from './text/RegexTester';
import TimestampConverter from './developer/TimestampConverter';
import UrlCodec from './encoding/UrlCodec';
import UuidGenerator from './developer/UuidGenerator';
import YamlConverter from './format/YamlConverter';

export const toolComponents = {
	base64: Base64Codec,
	case: CaseConverter,
	color: ColorConverter,
	'css-minify': CssMinify,
	csv: CsvConverter,
	diff: DiffViewer,
	hash: HashGenerator,
	json: JsonFormatter,
	jwt: JwtDecoder,
	markdown: MarkdownPreview,
	password: PasswordGenerator,
	regex: RegexTester,
	timestamp: TimestampConverter,
	url: UrlCodec,
	uuid: UuidGenerator,
	yaml: YamlConverter,
};

export type ToolComponentId = keyof typeof toolComponents;
