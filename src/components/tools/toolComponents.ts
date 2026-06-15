import Base64Codec from './Base64Codec';
import CaseConverter from './CaseConverter';
import ColorConverter from './ColorConverter';
import CssMinify from './CssMinify';
import CsvConverter from './CsvConverter';
import DiffViewer from './DiffViewer';
import HashGenerator from './HashGenerator';
import JsonFormatter from './JsonFormatter';
import JwtDecoder from './JwtDecoder';
import MarkdownPreview from './MarkdownPreview';
import PasswordGenerator from './PasswordGenerator';
import RegexTester from './RegexTester';
import TimestampConverter from './TimestampConverter';
import UrlCodec from './UrlCodec';
import UuidGenerator from './UuidGenerator';
import YamlConverter from './YamlConverter';

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
