import CodeEditor from '@features/tools/shared/CodeEditor';
import IoWorkbench from '@features/tools/shared/IoWorkbench';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { useAppMessage } from '@shared/ui/AppMessage';
import { useTheme } from '@themes/ThemeContext';
import { jsonInputExample, jsonSampleToProto } from '../proto-shared/functions';
import { jsonToProtoReference } from './references';

interface JsonToProtoState {
	input: string;
	output: string;
	lastInput: string;
	rootMessageName: string;
	lastRootMessageName: string;
}

const text = {
	tool: 'JSON → Proto',
	input: 'JSON 样例',
	output: 'Proto message',
	generate: '生成 Proto',
	success: '已生成',
	pending: '待执行',
	dirty: '输入已变化，点击操作按钮更新输出。',
};

export default function JsonToProtoTool() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const [state, setState] = useToolStorage<JsonToProtoState>('bytekit:tool:json-to-proto:v1', {
		input: jsonInputExample,
		output: '',
		lastInput: '',
		rootMessageName: 'RootMessage',
		lastRootMessageName: '',
	});

	const rootMessageName = state.rootMessageName ?? 'RootMessage';
	const effectiveRootMessageName = rootMessageName.trim() ? rootMessageName : 'RootMessage';
	const isDirty = state.input !== state.lastInput || effectiveRootMessageName !== (state.lastRootMessageName || 'RootMessage');
	const hasOutput = state.output.trim().length > 0 && !isDirty;
	const outputStatus = hasOutput ? 'success' : 'neutral';
	const outputStatusText = hasOutput ? text.success : text.pending;

	useToolRefPanel('JSON 转 Proto 参考', jsonToProtoReference);

	function runAction() {
		const result = jsonSampleToProto(state.input, { rootMessageName: effectiveRootMessageName });
		if (!result.ok) {
			message.error(result.error);
			return;
		}
		setState((current) => ({
			...current,
			output: result.result,
			lastInput: current.input,
			lastRootMessageName: (current.rootMessageName ?? '').trim() ? current.rootMessageName : 'RootMessage',
		}));
	}

	return (
		<IoWorkbench
			ariaLabel={text.tool}
			actions={(
				<div className="proto-toolbar-actions">
					<label className="proto-message-control">
						<span>Message</span>
						<input
							type="text"
							value={rootMessageName}
							aria-label="Message 名称"
							spellCheck={false}
							onChange={(event) => setState((current) => ({ ...current, rootMessageName: event.target.value }))}
							onKeyDown={(event) => { if (event.key === 'Enter') runAction(); }}
						/>
					</label>
					<Button variant="primary" onClick={runAction}>{text.generate}</Button>
				</div>
			)}
			input={(
				<CodeEditor
					title={text.input}
					value={state.input}
					onChange={(input) => setState((current) => ({ ...current, input }))}
					language="json"
				/>
			)}
			output={(
				<CodeEditor
					title={text.output}
					value={state.output}
					language="proto"
					status={outputStatus}
					statusText={outputStatusText}
					message={isDirty ? text.dirty : undefined}
				/>
			)}
		/>
	);
}
