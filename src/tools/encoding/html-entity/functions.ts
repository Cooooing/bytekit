const HTML_ENTITIES: Record<string, string> = {
	'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
	'/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;',
};

const REVERSE_ENTITIES: Record<string, string> = {};
for (const [char, entity] of Object.entries(HTML_ENTITIES)) {
	REVERSE_ENTITIES[entity] = char;
}

export function encodeHtmlEntities(text: string): { ok: true; output: string } | { ok: false; error: string } {
	try {
		const output = text.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
		return { ok: true, output };
	} catch (e) {
		return { ok: false, error: String(e) };
	}
}

export function decodeHtmlEntities(text: string): { ok: true; output: string } | { ok: false; error: string } {
	try {
		const output = text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&#x2F;|&#x60;|&#x3D;/g, (entity) => REVERSE_ENTITIES[entity] || entity);
		return { ok: true, output };
	} catch (e) {
		return { ok: false, error: String(e) };
	}
}
