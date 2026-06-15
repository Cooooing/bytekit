import { useMemo } from 'react';
import CodeEditor from '../../editor/CodeEditor';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import ReferencePanel from '../../ui/ReferencePanel';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { decodeJwt } from '../../../lib/tools/crypto/jwt';
import { jwtReference } from '../../../lib/tools/references';
import { IoWorkbench } from '../ToolLayouts';

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
	const [state, setState] = useToolStorage('bytekit:tool:jwt:v1', { token: '' });
	const { token } = state;
	const setToken = (value: string) => setState((current) => ({ ...current, token: value }));
	const result = useMemo(() => decodeJwt(token), [token]);
	const isEmpty = token.trim() === '';
	const output = isEmpty || !result.ok ? '' : formatResult(result);

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
			<ReferencePanel title="JWT 参考" sections={jwtReference} />
		</>
	);
}
