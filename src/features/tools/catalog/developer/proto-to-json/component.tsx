import { useMemo } from 'react';
import CodeEditor from '@features/tools/shared/CodeEditor';
import IoWorkbench from '@features/tools/shared/IoWorkbench';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { useAppMessage } from '@shared/ui/AppMessage';
import { useTheme } from '@themes/ThemeContext';
import { listProtoMessages, protoInputExample, protoToJsonSample, protoToRandomJsonSample } from '../proto-shared/functions';
import { protoToJsonReference } from './references';

interface ProtoToJsonState {
	input: string;
	output: string;
	lastInput: string;
}

const text = {
	tool: 'Proto → JSON',
	input: 'Proto message',
	output: 'JSON 样例',
	generate: '生成 JSON',
	random: '随机生成',
	success: '已生成',
	pending: '待执行',
	dirty: '输入已变化，点击操作按钮更新输出。',
};

export default function ProtoToJsonTool() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const [state, setState] = useToolStorage<ProtoToJsonState>('bytekit:tool:proto-to-json:v1', {
		input: protoInputExample,
		output: '',
		lastInput: '',
	});

	const messageOptions = useMemo(() => {
		const result = listProtoMessages(state.input);
		return result.ok ? result.result : [];
	}, [state.input]);

	const activeMessageName = messageOptions[0]?.fullName ?? '';
	const isDirty = state.input !== state.lastInput;
	const hasOutput = state.output.trim().length > 0 && !isDirty;
	const outputStatus = hasOutput ? 'success' : 'neutral';
	const outputStatusText = hasOutput ? text.success : text.pending;

	useToolRefPanel('Proto 转 JSON 参考', protoToJsonReference);

	function runAction(random = false) {
		const result = random
			? protoToRandomJsonSample({ schema: state.input, messageName: activeMessageName })
			: protoToJsonSample({ schema: state.input, messageName: activeMessageName });
		if (!result.ok) {
			message.error(result.error);
			return;
		}
		setState((current) => ({
			...current,
			output: result.result,
			lastInput: current.input,
		}));
	}

	return (
		<IoWorkbench
			ariaLabel={text.tool}
			actions={(
				<>
					<Button variant="primary" onClick={() => runAction(false)}>{text.generate}</Button>
					<Button variant="secondary" onClick={() => runAction(true)}>{text.random}</Button>
				</>
			)}
			input={(
				<CodeEditor
					title={text.input}
					value={state.input}
					onChange={(input) => setState((current) => ({ ...current, input }))}
					language="proto"
				/>
			)}
			output={(
				<CodeEditor
					title={text.output}
					value={state.output}
					language="json"
					status={outputStatus}
					statusText={outputStatusText}
					message={isDirty ? text.dirty : undefined}
				/>
			)}
		/>
	);
}
