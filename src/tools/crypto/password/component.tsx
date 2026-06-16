import { Hash, RotateCw, Shuffle } from 'lucide-react';
import { useMemo, useState } from 'react';
import Button from '../../../../components/shared/ui/Button';
import { generatePassword, type PasswordMode } from './functions';
import { useToolStorage } from '../../../../hooks/useToolStorage';
import GeneratorPanel from '../../../../components/shared/layouts/GeneratorPanel';

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
	const [state, setState] = useToolStorage('bytekit:tool:password:v1', {
		mode: 'random' as PasswordMode,
		length: 16,
		lowercase: true,
		uppercase: true,
		numbers: true,
		symbols: true,
	});
	const { mode, length, lowercase, uppercase, numbers, symbols } = state;
	const [nonce, setNonce] = useState(0);
	const [notice, setNotice] = useState('');
	const result = useMemo(
		() => generatePassword({ mode, length, lowercase, uppercase, numbers, symbols }),
		[mode, length, lowercase, uppercase, numbers, symbols, nonce],
	);

	const output = result.ok ? result.password : '';

	function updateSetting<Key extends keyof typeof state>(key: Key, value: typeof state[Key]) {
		setState((current) => ({ ...current, [key]: value }));
	}

	async function copyPassword() {
		if (!output) return;
		try {
			await navigator.clipboard.writeText(output);
			setNotice('已复制');
		} catch {
			setNotice('复制失败');
		}
	}

	function switchMode(nextMode: PasswordMode) {
		setState((current) => ({
			...current,
			mode: nextMode,
			length: nextMode === 'pin' ? 6 : Math.max(current.length, 12),
		}));
		setNonce((value) => value + 1);
	}

	const controls = (
		<div className="password-card password-card--controls">
			<div className="password-card__section">
				<h2 className="password-card__title">选择密码类型</h2>
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

			<div className="password-card__section">
				<h2 className="password-card__title">自定义新密码</h2>
				<div className="password-length-row">
					<label className="password-length-row__label" htmlFor="password-length">字符</label>
					<input
						id="password-length"
						className="password-range"
						type="range"
						min={4}
						max={mode === 'pin' ? 12 : 128}
						value={length}
						onChange={(event) => updateSetting('length', Number(event.target.value))}
					/>
					<input
						className="password-length-input"
						type="number"
						min={4}
						max={mode === 'pin' ? 12 : 128}
						value={length}
						onChange={(event) => updateSetting('length', Number(event.target.value))}
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
	);

	const resultPanel = (
		<div className="password-card password-card--result">
			<div className="password-card__title-row">
				<h2 className="password-card__title">生成密码</h2>
				{notice ? <span className="password-notice">{notice}</span> : null}
			</div>
			<div className={result.ok ? 'password-output' : 'password-output password-output--error'}>
				{result.ok ? renderPassword(output) : result.error}
			</div>
		</div>
	);

	const actions = (
		<div className="password-card__actions">
			<Button disabled={!result.ok || !output} onClick={copyPassword}>复制密码</Button>
			<Button variant="secondary" onClick={() => setNonce((value) => value + 1)}>
				<RotateCw size={17} strokeWidth={2} aria-hidden="true" />
				刷新密码
			</Button>
		</div>
	);

	return <GeneratorPanel ariaLabel="随机密码工具" controls={controls} result={resultPanel} actions={actions} />;
}
