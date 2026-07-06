import { useEffect, useMemo, useRef } from 'react';
import CodeEditor from '@features/tools/shared/CodeEditor';
import IoWorkbench from '@features/tools/shared/IoWorkbench';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue';
import { useAppMessage } from '@shared/ui/AppMessage';
import { useTheme } from '@themes/ThemeContext';
import { listProtoMessages, protoInputExample, protoToJsonSample, protoToRandomJsonSample, type ProtoJsonFieldNameStyle } from '../proto-shared/functions';
import { protoToJsonReference } from './references';

interface ProtoToJsonState {
	input: string;
	output: string;
	lastInput: string;
	selectedMessageName: string;
	lastMessageName: string;
	fieldNameStyle: ProtoJsonFieldNameStyle;
	lastFieldNameStyle: ProtoJsonFieldNameStyle;
	error: string;
}

const text = {
	tool: 'Proto → JSON',
	input: 'Proto message',
	output: 'JSON 样例',
	generate: '生成 JSON',
	random: '随机生成',
	success: '已同步',
	randomSuccess: '已随机生成',
	fail: '输入无效',
	waiting: '等待输入',
	syncing: '更新中',
};

const fieldNameStyleOptions: Array<{ value: ProtoJsonFieldNameStyle; label: string }> = [
	{ value: 'camelCase', label: 'camelCase' },
	{ value: 'PascalCase', label: 'PascalCase' },
	{ value: 'snake_case', label: 'snake_case' },
	{ value: 'original', label: '原始字段名' },
];

export default function ProtoToJsonTool() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const lastAutoError = useRef('');
	const [state, setState] = useToolStorage<ProtoToJsonState>('bytekit:tool:proto-to-json:v1', {
		input: protoInputExample,
		output: '',
		lastInput: '',
		selectedMessageName: '',
		lastMessageName: '',
		fieldNameStyle: 'camelCase',
		lastFieldNameStyle: 'camelCase',
		error: '',
	});

	const messageOptions = useMemo(() => {
		const result = listProtoMessages(state.input);
		return result.ok ? result.result : [];
	}, [state.input]);

	const selectedMessage = messageOptions.find((item) => item.fullName === state.selectedMessageName);
	const preferredMessage = messageOptions.find((item) => item.fieldCount > 0) ?? messageOptions[0];
	const activeMessageName = (selectedMessage ?? preferredMessage)?.fullName ?? '';
	const fieldNameStyle = state.fieldNameStyle ?? 'camelCase';
	const debouncedInput = useDebouncedValue(state.input, 250);
	const debouncedMessageName = useDebouncedValue(activeMessageName, 250);
	const debouncedFieldNameStyle = useDebouncedValue(fieldNameStyle, 250);
	const isDirty = state.input !== state.lastInput || activeMessageName !== (state.lastMessageName ?? '') || fieldNameStyle !== (state.lastFieldNameStyle ?? 'camelCase');
	const hasOutput = state.output.trim().length > 0 && !isDirty && !state.error;
	const outputStatus = state.error ? 'error' : hasOutput ? 'success' : 'neutral';
	const outputStatusText = !state.input.trim() ? text.waiting : state.error ? text.fail : isDirty ? text.syncing : hasOutput ? text.success : text.waiting;

	useToolRefPanel('Proto 转 JSON 参考', protoToJsonReference);

	function runAction(random = false, value = state.input, messageName = activeMessageName, nameStyle = fieldNameStyle, auto = false) {
		const result = random
			? protoToRandomJsonSample({ schema: value, messageName, fieldNameStyle: nameStyle })
			: protoToJsonSample({ schema: value, messageName, fieldNameStyle: nameStyle });
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
			lastMessageName: messageName,
			lastFieldNameStyle: nameStyle,
			error: '',
		}));
	}

	useEffect(() => {
		if (!debouncedInput.trim()) {
			lastAutoError.current = '';
			setState((current) => ({ ...current, error: '' }));
			return;
		}
		runAction(false, debouncedInput, debouncedMessageName, debouncedFieldNameStyle, true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedInput, debouncedMessageName, debouncedFieldNameStyle]);

	return (
		<IoWorkbench
			ariaLabel={text.tool}
			actions={(
				<div className="proto-toolbar-actions">
					{messageOptions.length > 1 ? (
						<label className="proto-message-control">
							<span>Message</span>
							<select
								value={activeMessageName}
								aria-label="Message"
								onChange={(event) => setState((current) => ({ ...current, selectedMessageName: event.target.value }))}
							>
								{messageOptions.map((item) => (
									<option key={item.fullName} value={item.fullName}>
										{item.fullName}
									</option>
								))}
							</select>
						</label>
					) : null}
					<label className="proto-message-control proto-message-control--compact">
						<span>命名</span>
						<select
							value={fieldNameStyle}
							aria-label="JSON 字段命名风格"
							onChange={(event) => setState((current) => ({ ...current, fieldNameStyle: event.target.value as ProtoJsonFieldNameStyle }))}
						>
							{fieldNameStyleOptions.map((item) => (
								<option key={item.value} value={item.value}>
									{item.label}
								</option>
							))}
						</select>
					</label>
					<Button variant="primary" onClick={() => runAction(false)}>{text.generate}</Button>
					<Button variant="secondary" onClick={() => runAction(true)}>{text.random}</Button>
				</div>
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
				/>
			)}
		/>
	);
}
