import { Hash, RotateCw, Shuffle } from 'lucide-react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { generatePassword, computeEntropy, PIN_MAX_LENGTH, RANDOM_PASSWORD_MAX_LENGTH, type PasswordMode } from './functions';
import { passwordReference } from './references';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { useTheme } from '@themes/ThemeContext';
import GeneratorPanel from '@features/tools/shared/GeneratorPanel';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useTransientNotice } from '@shared/hooks/useTransientNotice';
import { useAppMessage, useMessageOnError } from '@shared/ui/AppMessage';

const modeOptions: Array<{ value: PasswordMode; label: string; icon: typeof Shuffle }> = [
	{ value: 'random', label: '随机', icon: Shuffle },
	{ value: 'pin', label: 'PIN', icon: Hash },
];

const optionLabels = {
	lowercase: '小写字母',
	uppercase: '大写字母',
	numbers: '数字',
	symbols: '符号',
};

function renderPassword(value: string) {
	return Array.from(value).map((char, index) => {
		const type = /\d/.test(char) ? 'number' : /[a-z]/i.test(char) ? 'letter' : 'symbol';
		return <span key={char + '-' + String(index)} className={'password-output__char password-output__char--' + type}>{char}</span>;
	});
}

export default function PasswordGenerator() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const [state, setState] = useToolStorage('bytekit:tool:password:v1', {
		mode: 'random' as PasswordMode,
		length: 16,
		lowercase: true,
		uppercase: true,
		numbers: true,
		symbols: true,
	});
	const { mode, length, lowercase, uppercase, numbers, symbols } = state;
	const [isReady, setIsReady] = useState(false);
	const [nonce, setNonce] = useState(0);
	const [notice, showNotice] = useTransientNotice();
	const [lastPassword, setLastPassword] = useState('');
	const result = useMemo(
		() => isReady ? generatePassword({ mode, length, lowercase, uppercase, numbers, symbols }) : { ok: false as const, error: '正在生成密码。' },
		[isReady, mode, length, lowercase, uppercase, numbers, symbols, nonce],
	);

	const output = result.ok ? result.password : '';
	const displayPassword = result.ok ? result.password : lastPassword;
	useMessageOnError(!isReady || result.ok ? undefined : result.error);

	const entropy = useMemo(
		() => computeEntropy({ mode, length, lowercase, uppercase, numbers, symbols }),
		[mode, length, lowercase, uppercase, numbers, symbols],
	);

	const updateSetting = useCallback(<Key extends keyof typeof state>(key: Key, value: typeof state[Key]) => {
		setState((current) => ({ ...current, [key]: value }));
	}, []);

	const normalizeLength = useCallback((value: number) => {
		const max = mode === 'pin' ? PIN_MAX_LENGTH : RANDOM_PASSWORD_MAX_LENGTH;
		const next = Number.isFinite(value) ? Math.round(value) : 4;
		const clamped = Math.min(max, Math.max(4, next));
		updateSetting('length', clamped);
		if (clamped !== value) showNotice(`长度已调整为 ${clamped}`);
	}, [mode, showNotice, updateSetting]);

	const copyPassword = useCallback(async () => {
		if (!output) return;
		try {
			await navigator.clipboard.writeText(output);
			showNotice('已复制');
		} catch {
			message.error('复制失败。');
		}
	}, [message, output, showNotice]);

	const switchMode = useCallback((nextMode: PasswordMode) => {
		setState((current) => ({
			...current,
			mode: nextMode,
			length: nextMode === 'pin' ? Math.min(current.length, PIN_MAX_LENGTH) : Math.max(current.length, PIN_MAX_LENGTH),
		}));
		setNonce((value) => value + 1);
	}, []);

	const maxLength = mode === 'pin' ? PIN_MAX_LENGTH : RANDOM_PASSWORD_MAX_LENGTH;

	useEffect(() => {
		setIsReady(true);
	}, []);

	useEffect(() => {
		if (result.ok) setLastPassword(result.password);
	}, [result]);

	const controls = useMemo(() => (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">选择密码类型</h2>
				<div className="password-mode-tabs" role="tablist" aria-label="密码类型">
					{modeOptions.map((item) => {
						const Icon = item.icon;
						return (
							<button
								key={item.value}
								className={mode === item.value ? 'password-mode-tabs__item password-mode-tabs__item--active' : 'password-mode-tabs__item'}
								type="button"
								onClick={() => switchMode(item.value)}
								aria-selected={mode === item.value}
							>
								<Icon size={17} strokeWidth={2} aria-hidden="true" />
								{item.label}
							</button>
						);
					})}
				</div>
			</div>

			<div className="tool-card__section">
				<h2 className="tool-card__title">自定义新密码</h2>
				<div className="password-length-row">
					<label className="password-length-row__label" htmlFor="password-length">字符</label>
					<input
						id="password-length"
						className="password-range"
						type="range"
						min={4}
						max={maxLength}
						value={length}
						onChange={(event) => updateSetting('length', Number(event.target.value))}
					/>
					<input
						className="password-length-input"
						type="number"
						min={4}
						max={maxLength}
						value={length}
						onChange={(event) => updateSetting('length', Number(event.target.value))}
						onBlur={(event) => normalizeLength(Number(event.target.value))}
						aria-label="密码长度"
					/>
				</div>

				{mode === 'random' ? (
					<div className="password-choice-grid" aria-label="字符集">
						{([
							['lowercase', lowercase] as const,
							['uppercase', uppercase] as const,
							['numbers', numbers] as const,
							['symbols', symbols] as const,
						]).map(([key, checked]) => (
							<label className="inline-check" key={key}>
								<input
									type="checkbox"
									checked={checked}
									onChange={(event) => updateSetting(key, event.target.checked)}
								/>
								{optionLabels[key]}
							</label>
						))}
					</div>
				) : null}
			</div>
		</div>
	), [mode, switchMode, length, maxLength, lowercase, uppercase, numbers, symbols, updateSetting]);

	const resultPanel = useMemo(() => (
		<div className="tool-card tool-card--result">
			<div className="tool-card__title-row">
				<h2 className="tool-card__title">生成密码</h2>
			</div>
			<div className="password-output">
				{displayPassword ? renderPassword(displayPassword) : <span className="tool-empty-state">调整设置后生成密码。</span>}
			</div>
			{result.ok ? (
				<div className="password-strength">
					<div className="password-strength__bar">
						<div className={`password-strength__fill password-strength__fill--${entropy.strength}`} />
					</div>
					<div className="password-strength__info">
						<span className="password-strength__label">{entropy.strengthLabel}</span>
						<span className="password-strength__bits">{entropy.bits} bits · 字符集 {entropy.poolSize}</span>
					</div>
				</div>
			) : null}
		</div>
	), [result, displayPassword, entropy]);

	const actions = useMemo(() => (
		<div className="tool-card__actions copy-action-group">
			{notice ? <span className="copy-feedback password-notice" role="status" aria-live="polite">{notice}</span> : null}
			<Button disabled={!result.ok || !output} onClick={copyPassword}>复制密码</Button>
			<Button variant="secondary" onClick={() => setNonce((value) => value + 1)}>
				<RotateCw size={17} strokeWidth={2} aria-hidden="true" />
				刷新密码
			</Button>
		</div>
	), [result, output, notice, copyPassword]);

	useToolRefPanel('密码安全参考', passwordReference);

	return <GeneratorPanel ariaLabel="随机密码工具" controls={controls} result={resultPanel} actions={actions} />;
}
