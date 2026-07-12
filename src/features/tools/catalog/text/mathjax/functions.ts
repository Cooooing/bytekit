import mathJaxScriptUrl from 'mathjax-full/es5/tex-svg-full.js?url';

export interface RenderedFormula {
	svg: string;
	mathml: string;
}

interface MathJaxRuntime {
	render: (tex: string) => Promise<RenderedFormula>;
}

let runtimePromise: Promise<MathJaxRuntime> | undefined;

export function renderTexFormula(tex: string): Promise<RenderedFormula> {
	if (!tex.trim()) return Promise.reject(new Error('请输入 LaTeX/TeX 公式。'));
	return loadMathJaxRuntime().then((runtime) => runtime.render(tex));
}

function loadMathJaxRuntime(): Promise<MathJaxRuntime> {
	if (!runtimePromise) runtimePromise = createMathJaxRuntime();
	return runtimePromise;
}

async function createMathJaxRuntime(): Promise<MathJaxRuntime> {
	if (typeof window !== 'undefined') return createBrowserRuntime();
	return createNodeRuntime();
}

interface BrowserMathJax {
	startup: { promise: Promise<void> };
	tex2svgPromise: (tex: string, options: { display: boolean }) => Promise<Element>;
	tex2mmlPromise: (tex: string, options: { display: boolean }) => Promise<string>;
}

async function createBrowserRuntime(): Promise<MathJaxRuntime> {
	await loadMathJaxBrowserScript();
	const mathjax = (window as Window & { MathJax?: BrowserMathJax }).MathJax;
	if (!mathjax) throw new Error('MathJax 运行时加载失败。');
	await mathjax.startup.promise;

	return {
		async render(input) {
			const options = { display: true };
			const [svgNode, mathml] = await Promise.all([
				mathjax.tex2svgPromise(input, options),
				mathjax.tex2mmlPromise(input, options),
			]);
			const error = mathml.match(/data-mjx-error="([^"]+)"/);
			if (error) throw new Error(error[1]);
			const svg = svgNode.querySelector('svg')?.outerHTML;
			if (!svg) throw new Error('未生成 SVG 公式。');
			return { svg, mathml };
		},
	};
}

function loadMathJaxBrowserScript(): Promise<void> {
	if ((window as Window & { MathJax?: BrowserMathJax }).MathJax?.startup) return Promise.resolve();
	return new Promise((resolve, reject) => {
		const existing = document.querySelector<HTMLScriptElement>('script[data-bytekit-mathjax]');
		if (existing) {
			existing.addEventListener('load', () => resolve(), { once: true });
			existing.addEventListener('error', () => reject(new Error('MathJax 运行时加载失败。')), { once: true });
			return;
		}
		const script = document.createElement('script');
		script.setAttribute('data-bytekit-mathjax', 'true');
		script.src = mathJaxScriptUrl;
		script.async = true;
		script.onload = () => resolve();
		script.onerror = () => reject(new Error('MathJax 运行时加载失败。'));
		document.head.append(script);
	});
}

async function createNodeRuntime(): Promise<MathJaxRuntime> {
	const [
		{ mathjax },
		{ TeX },
		{ SVG },
		{ liteAdaptor },
		{ RegisterHTMLHandler },
		{ AllPackages },
		{ SerializedMmlVisitor },
		{ STATE },
	] = await Promise.all([
		import('mathjax-full/js/mathjax.js'),
		import('mathjax-full/js/input/tex.js'),
		import('mathjax-full/js/output/svg.js'),
		import('mathjax-full/js/adaptors/liteAdaptor.js'),
		import('mathjax-full/js/handlers/html.js'),
		import('mathjax-full/js/input/tex/AllPackages.js'),
		import('mathjax-full/js/core/MmlTree/SerializedMmlVisitor.js'),
		import('mathjax-full/js/core/MathItem.js'),
	]);

	const adaptor = liteAdaptor();
	RegisterHTMLHandler(adaptor);
	const tex = new TeX({ packages: AllPackages });
	const svg = new SVG({ fontCache: 'none' });
	const document = mathjax.document('', { InputJax: tex, OutputJax: svg });
	const mmlVisitor = new SerializedMmlVisitor();

	return {
		async render(input) {
			const options = { display: true };
			const mmlRoot = document.convert(input, { ...options, end: STATE.COMPILED });
			const mathml = mmlVisitor.visitTree(mmlRoot);
			const error = mathml.match(/data-mjx-error="([^"]+)"/);
			if (error) throw new Error(error[1]);
			const svgNode = document.convert(input, options);
			return {
				svg: adaptor.outerHTML(adaptor.firstChild(svgNode)),
				mathml,
			};
		},
	};
}
