import { describe, expect, it } from 'vitest';
import { formatCode, minifyCode } from './shared-formatter';

describe('共享标记语言格式化', () => {
	it('格式化嵌套 HTML 标签', () => {
		expect(formatCode('<div><span>hello</span><p>world</p></div>', { mode: 'html' })).toBe([
			'<div>',
			'  <span>hello</span>',
			'  <p>world</p>',
			'</div>',
		].join('\n'));
	});

	it('格式化 XML 自闭合标签和文本节点', () => {
		expect(formatCode('<root><item id="1">A</item><empty /></root>', { mode: 'xml' })).toBe([
			'<root>',
			'  <item id="1">A</item>',
			'  <empty />',
			'</root>',
		].join('\n'));
	});

	it('保留 script 原始文本结构', () => {
		expect(formatCode('<script>const a = 1;\nconsole.log(a);</script>', { mode: 'html' })).toBe([
			'<script>',
			'  const a = 1;',
			'  console.log(a);',
			'</script>',
		].join('\n'));
	});

	it('压缩标记语言空白', () => {
		expect(minifyCode('<div>  <span>A</span> </div>')).toBe('<div><span>A</span></div>');
	});
});
