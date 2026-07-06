import { useEffect, useRef } from 'react';
import CodeEditor from '@features/tools/shared/CodeEditor';
import IoWorkbench from '@features/tools/shared/IoWorkbench';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue';
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
	error: string;
}

const text = {
	tool: 'JSON → Proto',
	input: 'JSON 样例',
	output: 'Proto message',
	generate: '生成 Proto',
	success: '已同步',
	fail: '输入无效',
	waiting: '等待输入',
	syncing: '更新中',
};

export default function JsonToProtoTool() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const lastAutoError = useRef('');
	const [state, setState] = useToolStorage<JsonToProtoState>('bytekit:tool:json-to-proto:v1', {
		input: jsonInputExample,
		output: '',
		lastInput: '',
		rootMessageName: 'RootMessage',
		lastRootMessageName: '',
		error: '',
	});

	const rootMessageName = state.rootMessageName ?? 'RootMessage';
	const effectiveRootMessageName = rootMessageName.trim() ? rootMessageName : 'RootMessage';
	const debouncedInput = useDebouncedValue(state.input, 250);
	const debouncedRootMessageName = useDebouncedValue(effectiveRootMessageName, 250);
	const isDirty = state.input !== state.lastInput || effectiveRootMessageName !== (state.lastRootMessageName || 'RootMessage');
	const hasOutput = state.output.trim().length > 0 && !isDirty && !state.error;
	const outputStatus = state.error ? 'error' : hasOutput ? 'success' : 'neutral';
	const outputStatusText = !state.input.trim() ? text.waiting : state.error ? text.fail : isDirty ? text.syncing : hasOutput ? text.success : text.waiting;

	useToolRefPanel('JSON 转 Proto 参考', jsonToProtoReference);

	function runAction(value = state.input, messageName = effectiveRootMessageName, auto = false) {
		const result = jsonSampleToProto(value, { rootMessageName: messageName });
		if (!result.ok) {
			if (!auto || result.error !== lastAutoError.current) message.error(result.error);
			if (auto) lastAutoError.current = result.error;
			setState((current) => ({ ...current, error: result.error }));
			return;
		}
		lastAutoError.current = '';
		setState((current) => ({
			...current,
			output: result.result,
			lastInput: value,
			lastRootMessageName: messageName,
			error: '',
		}));
	}

	useEffect(() => {
		if (!debouncedInput.trim()) {
			lastAutoError.current = '';
			setState((current) => ({ ...current, error: '' }));
			return;
		}
		runAction(debouncedInput, debouncedRootMessageName, true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedInput, debouncedRootMessageName]);

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
					<Button variant="primary" onClick={() => runAction()}>{text.generate}</Button>
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
				/>
			)}
		/>
	);
}
