import { lazy } from 'react';

// Lazy-loaded tool components for code splitting.
// Each tool's component.tsx re-exports from the original implementation in src/components/tools/.
export const toolComponents: Record<string, React.LazyExoticComponent<any>> = {
	timestamp: lazy(() => import('./developer/timestamp/component')),
	uuid: lazy(() => import('./developer/uuid/component')),
	hash: lazy(() => import('./developer/hash/component')),
	color: lazy(() => import('./text/color/component')),
	url: lazy(() => import('./encoding/url/component')),
	regex: lazy(() => import('./text/regex/component')),
	diff: lazy(() => import('./text/diff/component')),
	markdown: lazy(() => import('./text/markdown/component')),
	case: lazy(() => import('./text/case/component')),
	csv: lazy(() => import('./format/csv/component')),
	yaml: lazy(() => import('./format/yaml/component')),
	'css-minify': lazy(() => import('./css/minify/component')),
	json: lazy(() => import('./json/format/component')),
	jwt: lazy(() => import('./crypto/jwt/component')),
	base64: lazy(() => import('./encoding/base64/component')),
	password: lazy(() => import('./crypto/password/component')),
};
