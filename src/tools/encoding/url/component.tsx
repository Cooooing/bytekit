import { useMemo, useState, useEffect } from 'react';
import CopyRow from '../../../components/shared/ui/CopyRow';
import { useRefPanel } from '../../../components/shared/layouts/RefPanelContext';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { encodeUrl, decodeUrl } from './functions';
import { urlReference } from './references';
import GeneratorPanel from '../../../components/shared/layouts/GeneratorPanel';
import { useTheme } from '../../../themes/ThemeContext';

export default function UrlCodec() {
	const { Button } = useTheme();
	const { setRefContent } = useRefPanel();
	const [state, setState] = useToolStorage('bytekit:tool:url:v1', {
		input: 'https://example.com/path?name=你好&lang=中文',
		lastAction: 'encode' as 'encode' | 'decode',
	});
	const { input, lastAction } = state;
	const setInput = (v: string) => setState((c) => ({ ...c, input: v }));

	function runAction(action: 'encode' | 'decode') {
		setState((c) => ({ ...c, lastAction: action }));
	}

	const result = useMemo(() =>
		lastAction === 'encode' ? encodeUrl(input) : decodeUrl(input),
		[input, lastAction]
	);

	const controls = (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">输入 URL 或文本</h2>
				<textarea
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="输入 URL 或要编码/解码的文本"
					aria-label="输入"
					rows={3}
					style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-subtle)', color: 'var(--text)', fontSize: '0.875rem', resize: 'vertical' }}
				/>
				<div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
					<Button variant={lastAction === 'encode' ? 'primary' : 'secondary'} onClick={() => runAction('encode')}>编码</Button>
					<Button variant={lastAction === 'decode' ? 'primary' : 'secondary'} onClick={() => runAction('decode')}>解码</Button>
				</div>
			</div>
		</div>
	);

	const resultPanel = (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">转换结果</h2>
			{result.ok ? (
				<div style={{ display: 'grid', gap: '8px' }}>
					<CopyRow label={lastAction === 'encode' ? '编码' : '解码'} value={lastAction === 'encode' ? result.encoded : result.decoded} />
					{result.components.hostname && (
						<>
							<div style={{ fontSize: '0.8125rem', fontWeight: 650, color: 'var(--muted)', marginTop: '4px' }}>URL 组件</div>
							<CopyRow label="协议" value={result.components.protocol} />
							<CopyRow label="主机" value={result.components.hostname} />
							{result.components.port && <CopyRow label="端口" value={result.components.port} />}
							<CopyRow label="路径" value={result.components.pathname} />
							{result.components.search && <CopyRow label="查询" value={result.components.search} />}
							{result.components.hash && <CopyRow label="哈希" value={result.components.hash} />}
							{result.components.params.length > 0 && (
								<>
									<div style={{ fontSize: '0.8125rem', fontWeight: 650, color: 'var(--muted)', marginTop: '4px' }}>查询参数</div>
									{result.components.params.map((p, i) => (
										<CopyRow key={i} label={p.key} value={p.value} />
									))}
								</>
							)}
						</>
					)}
				</div>
			) : (
				<div style={{ color: 'var(--semantic-danger)' }}>{result.error}</div>
			)}
		</div>
	);

	useEffect(() => {
		setRefContent({ title: 'URL 编码参考', sections: urlReference });
		return () => setRefContent(null);
	}, [setRefContent]);

	return (
		<GeneratorPanel ariaLabel="URL 编解码工具" controls={controls} result={resultPanel} />
	);
}
