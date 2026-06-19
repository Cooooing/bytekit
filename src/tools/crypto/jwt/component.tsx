import { useMemo } from 'react';
import CodeEditor from '../../../components/shared/editor/CodeEditor';
import Badge from '../../../components/shared/ui/Badge';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { decodeJwt } from './functions';
import { jwtReference } from './references';
import IoWorkbench from '../../../components/shared/layouts/IoWorkbench';
import { useTheme } from '../../../themes/ThemeContext';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';

const text = {
	tool: 'JWT 解析工具',
	result: '解析结果',
	waiting: '等待输入',
	success: '解析成功',
	fail: '解析失败',
	empty: '空状态',
	json: 'JSON 结果',
	auto: '输入后自动解析',
	emptyMessage: '输入 JWT 后显示 header 和 payload。',
	decode: '解析',
};

function formatResult(result: ReturnType<typeof decodeJwt>) {
	if (!result.ok) return '';
	return JSON.stringify({ header: result.header, payload: result.payload, hasSignature: result.hasSignature }, null, 2);
}

export default function JwtDecoder() {
	const { Button } = useTheme();
	const [state, setState] = useToolStorage('bytekit:tool:jwt:v1', { token: '' });
	const { token } = state;
	const setToken = (value: string) => setState((current) => ({ ...current, token: value }));
	const result = useMemo(() => decodeJwt(token), [token]);
	const isEmpty = token.trim() === '';
	const output = isEmpty || !result.ok ? '' : formatResult(result);

	useToolRefPanel('JWT', jwtReference);

	return (
		<>
			<IoWorkbench
				ariaLabel={text.tool}
				actions={(
					<>
						<Button variant="primary" disabled={isEmpty || !result.ok}>{text.decode}</Button>
						<span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>{text.auto}</span>
						<Badge tone={isEmpty ? 'neutral' : result.ok ? 'success' : 'danger'}>{isEmpty ? text.empty : result.ok ? text.success : text.fail}</Badge>
					</>
				)}
				input={<CodeEditor title="JWT" value={token} onChange={setToken} language="text" status={isEmpty ? 'neutral' : result.ok ? 'success' : 'error'} statusText={isEmpty ? text.waiting : result.ok ? text.success : text.fail} />}
				output={<CodeEditor title={text.result} value={output} language="json" status={isEmpty ? 'neutral' : result.ok ? 'success' : 'error'} statusText={isEmpty ? text.empty : result.ok ? text.json : text.fail} message={isEmpty ? text.emptyMessage : undefined} error={isEmpty || result.ok ? undefined : result.error} />}
			/>
		</>
	);
}
