export const mathjaxReference = [
	{
		title: '基础与分组',
		items: [
			{ syntax: 'x^2, x_{i}, x^{n+1}', desc: '上标、下标；多字符指数或下标必须使用花括号分组' },
			{ syntax: 'a_{i,j}, x_{\mathrm{max}}', desc: '下标可包含多个字符；\mathrm 用于直立文本' },
			{ syntax: '{a+b \over c+d}', desc: '花括号限定命令作用范围；推荐分式仍使用 \frac' },
			{ syntax: '\\left( \frac{a}{b} \\right)', desc: '自动调整圆括号大小；同样支持 [ ]、\\{ \\}、| |' },
			{ syntax: '\\bigl( x \\bigr), \\Bigl[ x \\Bigr]', desc: '手动控制定界符尺寸' },
		],
	},
	{
		title: '分式与根式',
		items: [
			{ syntax: '\\frac{a}{b}, \\dfrac{a}{b}', desc: '普通分式；\dfrac 强制使用较大的行间分式样式' },
			{ syntax: '\\tfrac{a}{b}', desc: '强制使用较紧凑的行内分式样式' },
			{ syntax: '\\sqrt{x}, \\sqrt[n]{x}', desc: '平方根与 n 次根' },
			{ syntax: '\\binom{n}{k}, \\dbinom{n}{k}', desc: '二项式系数' },
			{ syntax: '\\cfrac{1}{1+\\cfrac{1}{x}}', desc: '连分数' },
		],
	},
	{
		title: '运算与大型符号',
		items: [
			{ syntax: '\\sum_{i=1}^{n} i, \\prod_{i=1}^{n} i', desc: '求和与连乘' },
			{ syntax: '\\int_a^b f(x)\\,dx, \\iint_D f\\,dA', desc: '积分、二重积分；\\, 增加微小间距' },
			{ syntax: '\\lim_{x \\to 0} \\frac{\\sin x}{x}', desc: '极限与趋近箭头' },
			{ syntax: '\\oint_C f(z)\\,dz, \\partial_x f', desc: '闭合积分与偏导数' },
			{ syntax: '\\nabla f, \\infty, \\pm, \\times, \\cdot', desc: '梯度、无穷、正负、乘法与点乘' },
		],
	},
	{
		title: '关系与箭头',
		items: [
			{ syntax: 'a \\leq b, a \\geq b, a \\neq b', desc: '小于等于、大于等于、不等于' },
			{ syntax: 'x \\in A, A \\subseteq B, A \\cap B', desc: '属于、子集、交集；并集使用 \\cup' },
			{ syntax: 'A \\Rightarrow B, A \\Leftrightarrow B', desc: '蕴含与等价' },
			{ syntax: 'f: A \\to B, x \\mapsto f(x)', desc: '映射箭头与对应关系' },
			{ syntax: '\\overline{AB}, \\vec{v}, \\hat{x}', desc: '线段、向量和单位向量标记' },
		],
	},
	{
		title: '希腊字母与字体',
		items: [
			{ syntax: '\\alpha, \\beta, \\gamma, \\delta, \\epsilon', desc: '常用小写希腊字母' },
			{ syntax: '\\Gamma, \\Delta, \\Theta, \\Lambda, \\Omega', desc: '常用大写希腊字母' },
			{ syntax: '\\mathbf{x}, \\mathit{x}, \\mathrm{sin}', desc: '粗体变量、斜体变量、直立运算符名称' },
			{ syntax: '\\mathbb{R}, \\mathbb{N}, \\mathcal{F}', desc: '黑板粗体集合与花体字母' },
			{ syntax: '\\text{当 } x > 0, \\quad \\text{时}', desc: '公式内插入文本；\\quad 增加较大间距' },
		],
	},
	{
		title: '矩阵与分段函数',
		items: [
			{ syntax: '\\begin{matrix} a & b \\\\ c & d \\end{matrix}', desc: '无定界符矩阵；& 分列，\\\\ 换行' },
			{ syntax: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', desc: '圆括号矩阵；也可使用 bmatrix、Bmatrix、vmatrix、Vmatrix' },
			{ syntax: '\\begin{cases} x^2 & x \\geq 0 \\\\ -x & x < 0 \\end{cases}', desc: '分段函数；每行用 & 分隔表达式与条件' },
			{ syntax: '\\begin{array}{cc} a & b \\\\ c & d \\end{array}', desc: '自定义列对齐；c、l、r 分别表示居中、左对齐、右对齐' },
		],
	},
	{
		title: '多行公式与对齐',
		items: [
			{ syntax: '\\begin{aligned} a &= b + c \\\\ d &= e + f \\end{aligned}', desc: '多行公式；& 指定对齐位置' },
			{ syntax: '\\begin{gathered} a=b \\\\ c=d \\end{gathered}', desc: '多行居中排列，不指定对齐点' },
			{ syntax: 'a \\\\[-0.25em] b', desc: '换行后可用方括号调整额外行距' },
			{ syntax: '\\underbrace{a+b}_{\\text{说明}}, \\overbrace{a+b}^{n}', desc: '下括号、上括号及注释' },
		],
	},
	{
		title: '间距、注释与转义',
		items: [
			{ syntax: 'a\\,b \\; c \\quad d \\qquad e', desc: '从小到大的常用数学间距' },
			{ syntax: '\\text{速度 } v = \\frac{s}{t}', desc: '使用 \\text 插入正常文本与中文' },
			{ syntax: '\\% \\# \\_ \\& \\{ \\}', desc: '输出特殊字符时需要用反斜杠转义' },
			{ syntax: '\\newcommand{\\RR}{\\mathbb{R}} \\quad x \\in \\RR', desc: '定义并使用自定义宏' },
			{ syntax: '\\color{red}{x}, \\bbox[lightyellow]{x}', desc: '颜色和背景框；应避免用于承载关键语义' },
		],
	},
	{
		title: '限制',
		items: [
			{ syntax: '输入范围', desc: '支持 LaTeX/TeX 公式输入，不需要包裹 $、$$、\\( \\) 或 \\[ \\]' },
			{ syntax: '当前不支持', desc: '不支持 AsciiMath、MathML 输入、公式计算、OCR 或图片转公式' },
			{ syntax: '兼容性', desc: '复杂宏、第三方 TeX 包和部分扩展环境可能无法在浏览器中渲染' },
		],
	},
];
