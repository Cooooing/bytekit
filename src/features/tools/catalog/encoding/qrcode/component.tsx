import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import GeneratorPanel from '@features/tools/shared/GeneratorPanel';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useAppMessage, useMessageOnError } from '@shared/ui/AppMessage';
import CopyRow from '@features/tools/shared/CopyRow';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { useTheme } from '@themes/ThemeContext';
import {
	buildQrContent,
	normalizeQrMargin,
	normalizeQrSize,
	type QrContentState,
	type QrErrorCorrectionLevel,
	type QrMode,
} from './functions';
import { qrcodeReference } from './references';

const modes: Array<{ value: QrMode; label: string }> = [
	{ value: 'text', label: '文本' },
	{ value: 'url', label: 'URL' },
	{ value: 'wifi', label: 'Wi-Fi' },
	{ value: 'contact', label: '联系人' },
	{ value: 'email', label: '邮箱' },
	{ value: 'phone', label: '电话' },
	{ value: 'sms', label: '短信' },
];

const levels: Array<{ value: QrErrorCorrectionLevel; label: string }> = [
	{ value: 'L', label: 'L' },
	{ value: 'M', label: 'M' },
	{ value: 'Q', label: 'Q' },
	{ value: 'H', label: 'H' },
];

interface QrcodeState extends QrContentState {
	errorCorrectionLevel: QrErrorCorrectionLevel;
	size: number;
	margin: number;
	foreground: string;
	background: string;
}

interface RenderedQr {
	content: string;
	label: string;
	dataUrl: string;
	svg: string;
}

export default function QrcodeTool() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [state, setState] = useToolStorage<QrcodeState>('bytekit:tool:qrcode:v1', {
		mode: 'text',
		text: 'https://bytekit.dev',
		url: 'https://bytekit.dev',
		wifiSsid: '',
		wifiPassword: '',
		wifiEncryption: 'WPA',
		wifiHidden: false,
		contactName: '',
		contactPhone: '',
		contactEmail: '',
		emailAddress: '',
		emailSubject: '',
		emailBody: '',
		phone: '',
		smsPhone: '',
		smsBody: '',
		errorCorrectionLevel: 'M',
		size: 260,
		margin: 2,
		foreground: '#111827',
		background: '#FFFFFF',
	});
	const contentResult = useMemo(() => buildQrContent(state), [state]);
	const renderInput = useMemo(() => ({
		contentResult,
		errorCorrectionLevel: state.errorCorrectionLevel,
		size: state.size,
		margin: state.margin,
		foreground: state.foreground,
		background: state.background,
	}), [contentResult, state.background, state.errorCorrectionLevel, state.foreground, state.margin, state.size]);
	const debouncedRenderInput = useDebouncedValue(renderInput, 180);
	const [rendered, setRendered] = useState<RenderedQr | null>(null);
	const [decoded, setDecoded] = useState('');
	const [renderError, setRenderError] = useState<string | undefined>();

	useEffect(() => {
		if (!debouncedRenderInput.contentResult.ok) {
			setRenderError(undefined);
			return;
		}

		let cancelled = false;
		const size = normalizeQrSize(debouncedRenderInput.size);
		const margin = normalizeQrMargin(debouncedRenderInput.margin);
		const options = {
			errorCorrectionLevel: debouncedRenderInput.errorCorrectionLevel,
			width: size,
			margin,
			color: {
				dark: debouncedRenderInput.foreground,
				light: debouncedRenderInput.background,
			},
		};

		Promise.all([
			QRCode.toDataURL(debouncedRenderInput.contentResult.content, options),
			QRCode.toString(debouncedRenderInput.contentResult.content, { ...options, type: 'svg' }),
		]).then(([dataUrl, svg]) => {
			if (cancelled) return;
			setRendered({
				content: debouncedRenderInput.contentResult.content,
				label: debouncedRenderInput.contentResult.label,
				dataUrl,
				svg,
			});
			setRenderError(undefined);
		}).catch(() => {
			if (!cancelled) setRenderError('二维码生成失败，请缩短内容或调整纠错等级。');
		});

		return () => {
			cancelled = true;
		};
	}, [debouncedRenderInput]);

	useMessageOnError(!contentResult.ok ? contentResult.error : renderError);
	useToolRefPanel('二维码参考', qrcodeReference);

	const controls = (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">内容类型</h2>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
					{modes.map((mode) => (
						<label key={mode.value} className={state.mode === mode.value ? 'regex-flag regex-flag--active' : 'regex-flag'} style={state.mode === mode.value ? activeFlagStyle : undefined}>
							<input type="radio" name="qr-mode" value={mode.value} checked={state.mode === mode.value} onChange={() => updateState({ mode: mode.value })} className="sr-only" />
							<span className="regex-flag__label">{mode.label}</span>
						</label>
					))}
				</div>
			</div>

			<div className="tool-card__section">
				<h2 className="tool-card__title">内容</h2>
				{renderContentFields()}
			</div>

			<div className="tool-card__section">
				<h2 className="tool-card__title">样式</h2>
				<div style={{ display: 'grid', gap: '10px' }}>
					<label style={fieldLabelStyle}>
						<span>纠错等级</span>
						<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
							{levels.map((level) => (
								<label key={level.value} className={state.errorCorrectionLevel === level.value ? 'regex-flag regex-flag--active' : 'regex-flag'} style={state.errorCorrectionLevel === level.value ? activeFlagStyle : undefined}>
									<input type="radio" name="qr-level" value={level.value} checked={state.errorCorrectionLevel === level.value} onChange={() => updateState({ errorCorrectionLevel: level.value })} className="sr-only" />
									<span className="regex-flag__label">{level.label}</span>
								</label>
							))}
						</div>
					</label>
					<label style={fieldLabelStyle}>
						<span>尺寸</span>
						<input className="tool-textarea" type="number" min={96} max={1024} value={state.size} onChange={(event) => updateState({ size: Number(event.target.value) })} />
					</label>
					<label style={fieldLabelStyle}>
						<span>边距</span>
						<input className="tool-textarea" type="number" min={0} max={12} value={state.margin} onChange={(event) => updateState({ margin: Number(event.target.value) })} />
					</label>
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
						<label style={fieldLabelStyle}>
							<span>前景色</span>
							<input className="password-length-input" type="color" value={state.foreground} onChange={(event) => updateState({ foreground: event.target.value })} />
						</label>
						<label style={fieldLabelStyle}>
							<span>背景色</span>
							<input className="password-length-input" type="color" value={state.background} onChange={(event) => updateState({ background: event.target.value })} />
						</label>
					</div>
				</div>
			</div>

			<div className="tool-card__section">
				<h2 className="tool-card__title">解析图片</h2>
				<input ref={fileInputRef} type="file" accept="image/*" onChange={(event) => handleDecodeFile(event.target.files?.[0] ?? null)} style={{ display: 'none' }} />
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
					<Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>选择图片</Button>
					{decoded ? <Button variant="ghost" size="sm" onClick={() => setDecoded('')}>清除解析结果</Button> : null}
				</div>
				<p style={{ color: 'var(--muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>图片只在本地浏览器解析，不上传。</p>
			</div>
		</div>
	);

	const resultPanel = (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">二维码结果</h2>
			{rendered ? (
				<div style={{ display: 'grid', gap: 'var(--space-4)' }}>
					<div className="tool-card__section" style={{ display: 'grid', justifyItems: 'center', gap: 'var(--space-3)' }}>
						<img src={rendered.dataUrl} alt="生成的二维码" style={{ width: 'min(100%, 18rem)', aspectRatio: '1', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: state.background, padding: 'var(--space-2)' }} />
						<div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
							<Button variant="secondary" size="sm" onClick={() => downloadDataUrl(rendered.dataUrl, 'bytekit-qrcode.png')}>下载 PNG</Button>
							<Button variant="ghost" size="sm" onClick={() => downloadText(rendered.svg, 'bytekit-qrcode.svg', 'image/svg+xml')}>下载 SVG</Button>
						</div>
					</div>
					<div style={{ display: 'grid', gap: '6px' }}>
						<CopyRow label={rendered.label} value={rendered.content} density="long" />
						{decoded ? <CopyRow label="解析结果" value={decoded} density="long" /> : null}
					</div>
				</div>
			) : (
				<div className="state-box">输入内容后显示二维码。</div>
			)}
		</div>
	);

	return <GeneratorPanel ariaLabel="二维码工具" controls={controls} result={resultPanel} />;

	function renderContentFields() {
		if (state.mode === 'text') {
			return <textarea className="tool-textarea" value={state.text} onChange={(event) => updateState({ text: event.target.value })} rows={5} aria-label="二维码文本" />;
		}
		if (state.mode === 'url') {
			return <input className="tool-textarea" type="url" value={state.url} onChange={(event) => updateState({ url: event.target.value })} aria-label="二维码 URL" />;
		}
		if (state.mode === 'wifi') {
			return (
				<div style={{ display: 'grid', gap: '8px' }}>
					<input className="tool-textarea" value={state.wifiSsid} onChange={(event) => updateState({ wifiSsid: event.target.value })} placeholder="Wi-Fi 名称" aria-label="Wi-Fi 名称" />
					<input className="tool-textarea" value={state.wifiPassword} onChange={(event) => updateState({ wifiPassword: event.target.value })} placeholder="Wi-Fi 密码" aria-label="Wi-Fi 密码" />
					<select className="tool-textarea" value={state.wifiEncryption} onChange={(event) => updateState({ wifiEncryption: event.target.value as QrcodeState['wifiEncryption'] })} aria-label="Wi-Fi 加密方式">
						<option value="WPA">WPA/WPA2</option>
						<option value="WEP">WEP</option>
						<option value="nopass">无密码</option>
					</select>
					<CheckToggle label="隐藏网络" checked={state.wifiHidden} onChange={(wifiHidden) => updateState({ wifiHidden })} />
				</div>
			);
		}
		if (state.mode === 'contact') {
			return (
				<div style={{ display: 'grid', gap: '8px' }}>
					<input className="tool-textarea" value={state.contactName} onChange={(event) => updateState({ contactName: event.target.value })} placeholder="姓名" aria-label="联系人姓名" />
					<input className="tool-textarea" value={state.contactPhone} onChange={(event) => updateState({ contactPhone: event.target.value })} placeholder="电话" aria-label="联系人电话" />
					<input className="tool-textarea" value={state.contactEmail} onChange={(event) => updateState({ contactEmail: event.target.value })} placeholder="邮箱" aria-label="联系人邮箱" />
				</div>
			);
		}
		if (state.mode === 'email') {
			return (
				<div style={{ display: 'grid', gap: '8px' }}>
					<input className="tool-textarea" value={state.emailAddress} onChange={(event) => updateState({ emailAddress: event.target.value })} placeholder="邮箱地址" aria-label="邮箱地址" />
					<input className="tool-textarea" value={state.emailSubject} onChange={(event) => updateState({ emailSubject: event.target.value })} placeholder="主题" aria-label="邮件主题" />
					<textarea className="tool-textarea" value={state.emailBody} onChange={(event) => updateState({ emailBody: event.target.value })} placeholder="正文" aria-label="邮件正文" rows={4} />
				</div>
			);
		}
		if (state.mode === 'phone') {
			return <input className="tool-textarea" value={state.phone} onChange={(event) => updateState({ phone: event.target.value })} placeholder="电话号码" aria-label="电话号码" />;
		}
		return (
			<div style={{ display: 'grid', gap: '8px' }}>
				<input className="tool-textarea" value={state.smsPhone} onChange={(event) => updateState({ smsPhone: event.target.value })} placeholder="短信号码" aria-label="短信号码" />
				<textarea className="tool-textarea" value={state.smsBody} onChange={(event) => updateState({ smsBody: event.target.value })} placeholder="短信内容" aria-label="短信内容" rows={4} />
			</div>
		);
	}

	function updateState(partial: Partial<QrcodeState>) {
		setState((current) => ({ ...current, ...partial }));
	}

	async function handleDecodeFile(file: File | null) {
		if (!file) return;
		try {
			const decodedText = await decodeQrImage(file);
			setDecoded(decodedText);
			message.success('二维码解析成功');
		} catch (error) {
			message.error(error instanceof Error ? error.message : '二维码解析失败。');
		} finally {
			if (fileInputRef.current) fileInputRef.current.value = '';
		}
	}
}

function CheckToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
	return (
		<label className={checked ? 'regex-flag regex-flag--active' : 'regex-flag'} style={checked ? activeFlagStyle : undefined}>
			<input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only" />
			<span className="regex-flag__label">{label}</span>
		</label>
	);
}

async function decodeQrImage(file: File): Promise<string> {
	const bitmap = await createImageBitmap(file);
	const canvas = document.createElement('canvas');
	canvas.width = bitmap.width;
	canvas.height = bitmap.height;
	const context = canvas.getContext('2d');
	if (!context) throw new Error('当前浏览器无法读取图片。');
	context.drawImage(bitmap, 0, 0);
	bitmap.close();
	const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
	const code = jsQR(imageData.data, imageData.width, imageData.height);
	if (!code?.data) throw new Error('未识别到二维码。');
	return code.data;
}

function downloadDataUrl(dataUrl: string, filename: string) {
	const link = document.createElement('a');
	link.href = dataUrl;
	link.download = filename;
	link.click();
}

function downloadText(text: string, filename: string, type: string) {
	const url = URL.createObjectURL(new Blob([text], { type }));
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}

const activeFlagStyle = {
	borderWidth: '2px',
	boxShadow: '0 0 0 2px var(--primary-soft)',
	background: 'var(--primary-soft)',
};

const fieldLabelStyle = {
	display: 'grid',
	gap: '4px',
	fontSize: '0.8rem',
	color: 'var(--muted)',
} as const;
