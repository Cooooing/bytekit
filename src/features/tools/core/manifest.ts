import type { ComponentType } from 'react';
import type { ToolCategory, ToolDefinition } from './types';

import { definition as timestampDef, category as developerCat } from '../catalog/developer/timestamp/definition';
import { definition as uuidDef } from '../catalog/developer/uuid/definition';
import { definition as hashDef } from '../catalog/developer/hash/definition';
import { definition as binaryDef } from '../catalog/developer/binary/definition';
import { definition as checksumDef } from '../catalog/developer/checksum/definition';
import { definition as baseConverterDef } from '../catalog/developer/base-converter/definition';
import { definition as cronDef } from '../catalog/developer/cron/definition';
import { definition as colorDef, category as textCat } from '../catalog/text/color/definition';
import { definition as urlDef } from '../catalog/encoding/url/definition';
import { definition as qrcodeDef } from '../catalog/encoding/qrcode/definition';
import { definition as regexDef } from '../catalog/text/regex/definition';
import { definition as diffDef } from '../catalog/text/diff/definition';
import { definition as markdownDef } from '../catalog/text/markdown/definition';
import { definition as caseDef } from '../catalog/text/case/definition';
import { definition as csvDef, category as formatCat } from '../catalog/format/csv/definition';
import { definition as yamlDef } from '../catalog/format/yaml/definition';
import { definition as cssMinifyDef, category as cssCat } from '../catalog/css/minify/definition';
import { definition as jsonDef, category as jsonCat } from '../catalog/json/format/definition';
import { definition as jwtDef, category as cryptoCat } from '../catalog/crypto/jwt/definition';
import { definition as base64Def, category as encodingCat } from '../catalog/encoding/base64/definition';
import { definition as htmlEntityDef } from '../catalog/encoding/html-entity/definition';
import { definition as jsEscapeDef } from '../catalog/encoding/js-escape/definition';
import { definition as passwordDef } from '../catalog/crypto/password/definition';
import { definition as cssUnitDef } from '../catalog/css/unit-converter/definition';
import { definition as wordCountDef } from '../catalog/text/word-count/definition';
import { definition as nanoidDef } from '../catalog/developer/nanoid/definition';
import { definition as jsonPathDef } from '../catalog/json/jsonpath/definition';
import { definition as xmlDef } from '../catalog/format/xml/definition';
import { definition as loremDef } from '../catalog/text/lorem/definition';
import { definition as htmlFormatDef } from '../catalog/format/html/definition';

export interface ToolManifestEntry {
	definition: ToolDefinition;
	loadComponent: () => Promise<{ default: ComponentType }>;
}

export const toolCategories: ToolCategory[] = [
	developerCat,
	encodingCat,
	cryptoCat,
	jsonCat,
	textCat,
	formatCat,
	cssCat,
];

export const toolEntries: ToolManifestEntry[] = [
	{ definition: timestampDef, loadComponent: () => import('../catalog/developer/timestamp/component') },
	{ definition: uuidDef, loadComponent: () => import('../catalog/developer/uuid/component') },
	{ definition: hashDef, loadComponent: () => import('../catalog/developer/hash/component') },
	{ definition: binaryDef, loadComponent: () => import('../catalog/developer/binary/component') },
	{ definition: checksumDef, loadComponent: () => import('../catalog/developer/checksum/component') },
	{ definition: baseConverterDef, loadComponent: () => import('../catalog/developer/base-converter/component') },
	{ definition: cronDef, loadComponent: () => import('../catalog/developer/cron/component') },
	{ definition: colorDef, loadComponent: () => import('../catalog/text/color/component') },
	{ definition: urlDef, loadComponent: () => import('../catalog/encoding/url/component') },
	{ definition: qrcodeDef, loadComponent: () => import('../catalog/encoding/qrcode/component') },
	{ definition: regexDef, loadComponent: () => import('../catalog/text/regex/component') },
	{ definition: diffDef, loadComponent: () => import('../catalog/text/diff/component') },
	{ definition: markdownDef, loadComponent: () => import('../catalog/text/markdown/component') },
	{ definition: caseDef, loadComponent: () => import('../catalog/text/case/component') },
	{ definition: csvDef, loadComponent: () => import('../catalog/format/csv/component') },
	{ definition: yamlDef, loadComponent: () => import('../catalog/format/yaml/component') },
	{ definition: cssMinifyDef, loadComponent: () => import('../catalog/css/minify/component') },
	{ definition: jsonDef, loadComponent: () => import('../catalog/json/format/component') },
	{ definition: jwtDef, loadComponent: () => import('../catalog/crypto/jwt/component') },
	{ definition: base64Def, loadComponent: () => import('../catalog/encoding/base64/component') },
	{ definition: htmlEntityDef, loadComponent: () => import('../catalog/encoding/html-entity/component') },
	{ definition: jsEscapeDef, loadComponent: () => import('../catalog/encoding/js-escape/component') },
	{ definition: passwordDef, loadComponent: () => import('../catalog/crypto/password/component') },
	{ definition: cssUnitDef, loadComponent: () => import('../catalog/css/unit-converter/component') },
	{ definition: wordCountDef, loadComponent: () => import('../catalog/text/word-count/component') },
	{ definition: nanoidDef, loadComponent: () => import('../catalog/developer/nanoid/component') },
	{ definition: jsonPathDef, loadComponent: () => import('../catalog/json/jsonpath/component') },
	{ definition: xmlDef, loadComponent: () => import('../catalog/format/xml/component') },
	{ definition: loremDef, loadComponent: () => import('../catalog/text/lorem/component') },
	{ definition: htmlFormatDef, loadComponent: () => import('../catalog/format/html/component') },
];
