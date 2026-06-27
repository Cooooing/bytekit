import { useMemo } from 'react';
import CopyRow from '@features/tools/shared/CopyRow';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { encodeUrl, decodeUrl, type UrlComponents } from './functions';
import { urlReference } from './references';
import GeneratorPanel from '@features/tools/shared/GeneratorPanel';
import { useTheme } from '@themes/ThemeContext';
import { useMessageOnError } from '@shared/ui/AppMessage';

type UrlAction = 'encode' | 'decode';

interface UrlDisplay {
	action: UrlAction;
	encoded: string;
	decoded: string;
	components: UrlComponents;
}

export default function UrlCodec() {
	const { Button } = useTheme();
	const [state, setState] = useToolStorage('bytekit:tool:url:v1', {
		input: 'https://example.com/path?name=你好&lang=中文',
		lastAction: 'encode' as UrlAction,
	});
	const { input, lastAction } = state;
	const setInput = (v: string) => setState((c) => ({ ...c, input: v }));

	function runAction(action: UrlAction) {
		setState((c) => ({ ...c, lastAction: action }));
	}

	const result = useMemo(() =>
		lastAction === 'encode' ? encodeUrl(input) : decodeUrl(input),
		[input, lastAction]
	);
	const currentDisplay = useMemo<UrlDisplay | null>(
		() => result.ok ? { action: lastAction, encoded: result.encoded, decoded: result.decoded, components: result.components } : null,
		[lastAction, result],
	);
	const displayResult = currentDisplay;

	useMessageOnError(!result.ok && input.trim() ? result.error : undefined);

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
			{displayResult ? (
				<div style={{ display: 'grid', gap: '8px' }}>
					<CopyRow label={displayResult.action === 'encode' ? '编码' : '解码'} value={displayResult.action === 'encode' ? displayResult.encoded : displayResult.decoded} density="long" />
					{displayResult.components.hostname && (
						<>
							<div style={{ fontSize: '0.8125rem', fontWeight: 650, color: 'var(--muted)', marginTop: '4px' }}>URL 组件</div>
							<CopyRow label="协议" value={displayResult.components.protocol} density="compact" />
							<CopyRow label="主机" value={displayResult.components.hostname} density="compact" />
							{displayResult.components.port && <CopyRow label="端口" value={displayResult.components.port} density="compact" />}
							<CopyRow label="路径" value={displayResult.components.pathname} density="compact" />
							{displayResult.components.search && <CopyRow label="查询" value={displayResult.components.search} density="long" />}
							{displayResult.components.hash && <CopyRow label="哈希" value={displayResult.components.hash} density="compact" />}
							{displayResult.components.params.length > 0 && (
								<>
									<div style={{ fontSize: '0.8125rem', fontWeight: 650, color: 'var(--muted)', marginTop: '4px' }}>查询参数</div>
									{displayResult.components.params.map((p, i) => (
										<CopyRow key={i} label={p.key} value={p.value} density="compact" />
									))}
								</>
							)}
						</>
					)}
				</div>
			) : (
				<div className="tool-empty-state">输入 URL 或文本后显示转换结果。</div>
			)}
		</div>
	);

	useToolRefPanel('URL 编码参考', urlReference);

	return (
		<GeneratorPanel ariaLabel="URL 编解码工具" controls={controls} result={resultPanel} />
	);
}
