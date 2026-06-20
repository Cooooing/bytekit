import { useMemo } from 'react';
import CodeEditor from '../../../components/shared/editor/CodeEditor';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { createJwt } from './functions';
import { jwtCreateReference } from './references';
import IoWorkbench from '../../../components/shared/layouts/IoWorkbench';
import { useTheme } from '../../../themes/ThemeContext';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';

const DEFAULT_HEADER = JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2);
const DEFAULT_PAYLOAD = JSON.stringify({ sub: '1001', name: 'Test User', iat: Math.floor(Date.now() / 1000) }, null, 2);

const text = {
	tool: 'JWT 生成器',
	input: 'Header',
	output: 'Generated Token',
	generate: '生成',
	success: '生成成功',
	fail: '生成失败',
	payloadLabel: 'Payload',
	secretLabel: '密钥（可选）',
};

export default function JwtCreator() {
	const { Button } = useTheme();
	const [state, setState] = useToolStorage('bytekit:tool:jwt-create:v1', {
		header: DEFAULT_HEADER,
		payload: DEFAULT_PAYLOAD,
		secret: '',
		token: '',
	});
	const { header, payload, secret, token } = state;
	const setHeader = (value: string) => setState((current) => ({ ...current, header: value }));
	const setPayload = (value: string) => setState((current) => ({ ...current, payload: value }));
	const setSecret = (value: string) => setState((current) => ({ ...current, secret: value }));

	function handleGenerate() {
		let parsedHeader: Record<string, unknown>;
		let parsedPayload: Record<string, unknown>;
		try {
			parsedHeader = JSON.parse(header);
		} catch {
			setState((current) => ({ ...current, token: '// Header: 无效的 JSON' }));
			return;
		}
		try {
			parsedPayload = JSON.parse(payload);
		} catch {
			setState((current) => ({ ...current, token: '// Payload: 无效的 JSON' }));
			return;
		}
		const result = createJwt(parsedHeader, parsedPayload, secret || undefined);
		setState((current) => ({
			...current,
			token: result.ok ? result.token : '// ' + result.error,
		}));
	}

	const status = useMemo(() => {
		if (!token) return 'neutral' as const;
		if (token.startsWith('//')) return 'error' as const;
		return 'success' as const;
	}, [token]);

	useToolRefPanel('JWT 生成参考', jwtCreateReference);

	return (
		<>
			<IoWorkbench
				ariaLabel={text.tool}
				actions={(
					<>
						<Button variant="primary" onClick={handleGenerate}>{text.generate}</Button>
						<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
							<label style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>{text.secretLabel}</label>
							<input
								type="text"
								value={secret}
								onChange={(e) => setSecret(e.target.value)}
								placeholder="留空则无签名"
								style={{
									background: 'var(--surface)',
									border: '1px solid var(--border)',
									borderRadius: '6px',
									padding: '4px 8px',
									fontSize: '0.8125rem',
									color: 'var(--fg)',
									width: '140px',
								}}
								aria-label="密钥"
							/>
						</div>
					</>
				)}
				input={
					<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
						<CodeEditor title={text.input} value={header} onChange={setHeader} language="json" />
						<CodeEditor title={text.payloadLabel} value={payload} onChange={setPayload} language="json" />
					</div>
				}
				output={<CodeEditor title={text.output} value={token} language="text" status={status} statusText={status === 'success' ? text.success : status === 'error' ? text.fail : '等待生成'} />}
			/>
		</>
	);
}
