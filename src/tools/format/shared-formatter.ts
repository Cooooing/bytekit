const SELF_CLOSING = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b/i;
const PRE_TAGS = /^(pre|script|style|textarea|code)\b/i;

export function formatCode(html: string, indentSize: number = 2): string {
    const indent = ' '.repeat(indentSize);
    let formatted = '';
    let level = 0;
    let inPre = false;
    let preTag = '';

    // Split into tokens: tags and text content
    const tokens = html.replace(/>\s*</g, '>\n<').split('\n');

    for (let token of tokens) {
        token = token.trim();
        if (!token) continue;

        // Handle closing tags
        if (token.startsWith('</')) {
            const tagName = token.match(/<\/(\w+)/)?.[1]?.toLowerCase() || '';
            if (inPre && tagName === preTag) {
                inPre = false;
            }
            level = Math.max(0, level - 1);
            formatted += indent.repeat(level) + token + '\n';
            continue;
        }

        // Handle preformatted content blocks
        if (!inPre) {
            const openMatch = token.match(/^<(\w+)/);
            if (openMatch && PRE_TAGS.test(openMatch[1])) {
                inPre = true;
                preTag = openMatch[1].toLowerCase();
            }
        }

        if (inPre) {
            // Keep preformatted content as-is (but still indent the opening tag)
            formatted += indent.repeat(level) + token + '\n';
            continue;
        }

        // Handle self-closing tags
        if (token.startsWith('<') && (token.endsWith('/>') || SELF_CLOSING.test(token.match(/^<(\w+)/)?.[1] || ''))) {
            formatted += indent.repeat(level) + token + '\n';
            continue;
        }

        // Handle opening tags
        if (token.startsWith('<') && !token.startsWith('<?') && !token.startsWith('<!')) {
            formatted += indent.repeat(level) + token + '\n';
            level++;
            continue;
        }

        // Default: text content
        formatted += indent.repeat(level) + token + '\n';
    }

    return formatted.trim();
}

export function minifyCode(html: string): string {
    return html
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .trim();
}
