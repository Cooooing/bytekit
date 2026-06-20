import { useMemo, useState, useCallback } from 'react';
import CodeEditor from '../../../components/shared/editor/CodeEditor';
import Badge from '../../../components/shared/ui/Badge';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { decodeJwt, createJwt } from './functions';
import { jwtReference } from './references';
import IoWorkbench from '../../../components/shared/layouts/IoWorkbench';
import { useTheme } from '../../../themes/ThemeContext';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';

const noop = () => {};

const DEFAULT_HEADER = JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2);
const DEFAULT_PAYLOAD = JSON.stringify({ sub: '1001', name: 'Test User', iat: Math.floor(Date.now() / 1000) }, null, 2);

type Mode = 'decode' | 'create';

const text = {
	tool: 'JWT 工具',
	decode: '解析',
	create: '生成',
	waiting: '等待输入',
	success: '成功',
	fail: '失败',
	empty: '空状态',
	json: 'JSON 结果',
	autoDecode: '输入后自动解析',
	emptyDecodeMessage: '输入 JWT 后显示 header 和 payload。',
	headerLabel: 'Header',
	payloadLabel: 'Payload',
	secretLabel: '密钥',
	secretPlaceholder: '留空则无签名',
	generate: '生成',
	decodeTitle: 'JWT',
	decodeResultTitle: '解析结果',
	createResultTitle: '生成结果',
};

function formatResult(result: ReturnType<typeof decodeJwt>) {
	if (!result.ok) return '';
	return JSON.stringify({ header: result.header, payload: result.payload, hasSignature: result.hasSignature }, null, 2);
}

export default function JwtDecoder() {
	const { Button } = useTheme();
	const [mode, setMode] = useState<Mode>('decode');

	const [state, setState] = useToolStorage<{
		token: string;
		header: string;
		payload: string;
		secret: string;
		createResult: string;
	}>('bytekit:tool:jwt:v2', {
		token: '',
		header: DEFAULT_HEADER,
		payload: DEFAULT_PAYLOAD,
		secret: '',
		createResult: '',
	});

	const { token, header, payload, secret, createResult } = state;

	// Decode mode
	const setToken = useCallback((value: string) => setState((current) => ({ ...current, token: value })), [setState]);
	const decodeResult = useMemo(() => decodeJwt(token), [token]);
	const isDecodeEmpty = token.trim() === '';
	const decodeOutput = isDecodeEmpty || !decodeResult.ok ? '' : formatResult(decodeResult);

	// Create mode
	const setHeader = useCallback((value: string) => setState((current) => ({ ...current, header: value })), [setState]);
	const setPayload = useCallback((value: string) => setState((current) => ({ ...current, payload: value })), [setState]);
	const setSecret = useCallback((value: string) => setState((current) => ({ ...current, secret: value })), [setState]);

	const handleGenerate = useCallback(async () => {
		let parsedHeader: Record<string, unknown>;
		let parsedPayload: Record<string, unknown>;
		try {
			parsedHeader = JSON.parse(header);
		} catch {
			setState((current) => ({ ...current, createResult: '// Header: 无效的 JSON' }));
			return;
		}
		try {
			parsedPayload = JSON.parse(payload);
		} catch {
			setState((current) => ({ ...current, createResult: '// Payload: 无效的 JSON' }));
			return;
		}
		const result = await createJwt(parsedHeader, parsedPayload, secret || undefined);
		setState((current) => ({
			...current,
			createResult: result.ok ? result.token : '// ' + result.error,
		}));
	}, [header, payload, secret, setState]);

	const createStatus = useMemo(() => {
		if (!createResult) return 'neutral' as const;
		if (createResult.startsWith('//')) return 'error' as const;
		return 'success' as const;
	}, [createResult]);

	const handleModeChange = useCallback((newMode: Mode) => {
		setMode(newMode);
	}, []);

	useToolRefPanel('JWT', jwtReference);

	const decodeActions = (
		<>
			<Button variant="primary" onClick={() => handleModeChange('decode')}>{text.decode}</Button>
			<Button variant="secondary" onClick={() => handleModeChange('create')}>{text.create}</Button>
			<Button variant="primary" disabled={isDecodeEmpty || !decodeResult.ok}>{text.decode}</Button>
			<span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>{text.autoDecode}</span>
			<Badge tone={isDecodeEmpty ? 'neutral' : decodeResult.ok ? 'success' : 'danger'}>{isDecodeEmpty ? text.empty : decodeResult.ok ? text.success : text.fail}</Badge>
		</>
	);

	const createActions = (
		<>
			<Button variant="secondary" onClick={() => handleModeChange('decode')}>{text.decode}</Button>
			<Button variant="primary" onClick={() => handleModeChange('create')}>{text.create}</Button>
			<Button variant="primary" onClick={handleGenerate}>{text.generate}</Button>
			<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
				<label style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>{text.secretLabel}</label>
				<input
					type="text"
					value={secret}
					onChange={(e) => setSecret(e.target.value)}
					placeholder={text.secretPlaceholder}
					style={{
						background: 'var(--surface)',
						border: '1px solid var(--border)',
						borderRadius: '6px',
						padding: '4px 8px',
						fontSize: '0.8125rem',
						color: 'var(--fg)',
						width: '140px',
					}}
					aria-label={text.secretLabel}
				/>
			</div>
		</>
	);

	if (mode === 'decode') {
		return (
			<IoWorkbench
				ariaLabel={text.tool}
				actions={decodeActions}
				input={<CodeEditor title={text.decodeTitle} value={token} onChange={setToken} language="text" status={isDecodeEmpty ? 'neutral' : decodeResult.ok ? 'success' : 'error'} statusText={isDecodeEmpty ? text.waiting : decodeResult.ok ? text.success : text.fail} />}
				output={<CodeEditor title={text.decodeResultTitle} value={decodeOutput} language="json" status={isDecodeEmpty ? 'neutral' : decodeResult.ok ? 'success' : 'error'} statusText={isDecodeEmpty ? text.empty : decodeResult.ok ? text.json : text.fail} message={isDecodeEmpty ? text.emptyDecodeMessage : undefined} error={isDecodeEmpty || decodeResult.ok ? undefined : decodeResult.error} onChange={noop} />}
			/>
		);
	}

	return (
		<IoWorkbench
			ariaLabel={text.tool}
			actions={createActions}
			input={
				<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
					<CodeEditor title={text.headerLabel} value={header} onChange={setHeader} language="json" />
					<CodeEditor title={text.payloadLabel} value={payload} onChange={setPayload} language="json" />
				</div>
			}
			output={<CodeEditor title={text.createResultTitle} value={createResult} language="text" status={createStatus} statusText={createStatus === 'success' ? text.success : createStatus === 'error' ? text.fail : '等待生成'} onChange={noop} />}
		/>
	);
}
