export type QrMode = 'text' | 'url' | 'wifi' | 'contact' | 'email' | 'phone' | 'sms';
export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrContentState {
	mode: QrMode;
	text: string;
	url: string;
	wifiSsid: string;
	wifiPassword: string;
	wifiEncryption: 'WPA' | 'WEP' | 'nopass';
	wifiHidden: boolean;
	contactName: string;
	contactPhone: string;
	contactEmail: string;
	emailAddress: string;
	emailSubject: string;
	emailBody: string;
	phone: string;
	smsPhone: string;
	smsBody: string;
}

export type QrContentResult =
	| { ok: true; content: string; label: string }
	| { ok: false; error: string };

export function buildQrContent(state: QrContentState): QrContentResult {
	switch (state.mode) {
		case 'text':
			return required(state.text, '请输入二维码文本。', '文本');
		case 'url':
			return buildUrlContent(state.url);
		case 'wifi':
			return buildWifiContent(state);
		case 'contact':
			return buildContactContent(state);
		case 'email':
			return buildEmailContent(state);
		case 'phone':
			return buildPhoneContent(state.phone);
		case 'sms':
			return buildSmsContent(state.smsPhone, state.smsBody);
	}
}

export function normalizeQrSize(value: number): number {
	if (!Number.isFinite(value)) return 240;
	return Math.min(1024, Math.max(96, Math.round(value)));
}

export function normalizeQrMargin(value: number): number {
	if (!Number.isFinite(value)) return 2;
	return Math.min(12, Math.max(0, Math.round(value)));
}

function required(value: string, error: string, label: string): QrContentResult {
	const trimmed = value.trim();
	if (!trimmed) return { ok: false, error };
	return { ok: true, content: trimmed, label };
}

function buildUrlContent(value: string): QrContentResult {
	const trimmed = value.trim();
	if (!trimmed) return { ok: false, error: '请输入 URL。' };
	try {
		const url = new URL(trimmed);
		if (!['http:', 'https:'].includes(url.protocol)) return { ok: false, error: 'URL 仅支持 http 或 https。' };
		return { ok: true, content: url.toString(), label: 'URL' };
	} catch {
		return { ok: false, error: '请输入合法 URL，例如 https://example.com。' };
	}
}

function buildWifiContent(state: QrContentState): QrContentResult {
	const ssid = state.wifiSsid.trim();
	if (!ssid) return { ok: false, error: '请输入 Wi-Fi 名称。' };
	if (state.wifiEncryption !== 'nopass' && !state.wifiPassword) return { ok: false, error: '请输入 Wi-Fi 密码，或选择无密码。' };
	const content = [
		'WIFI:',
		`T:${state.wifiEncryption};`,
		`S:${escapeWifiValue(ssid)};`,
		`P:${escapeWifiValue(state.wifiPassword)};`,
		state.wifiHidden ? 'H:true;' : '',
		';',
	].join('');
	return { ok: true, content, label: 'Wi-Fi' };
}

function buildContactContent(state: QrContentState): QrContentResult {
	const name = state.contactName.trim();
	const phone = state.contactPhone.trim();
	const email = state.contactEmail.trim();
	if (!name && !phone && !email) return { ok: false, error: '请至少输入联系人姓名、电话或邮箱。' };
	const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
	if (name) lines.push(`FN:${escapeVCardValue(name)}`);
	if (phone) lines.push(`TEL:${escapeVCardValue(phone)}`);
	if (email) lines.push(`EMAIL:${escapeVCardValue(email)}`);
	lines.push('END:VCARD');
	return { ok: true, content: lines.join('\n'), label: '联系人' };
}

function buildEmailContent(state: QrContentState): QrContentResult {
	const address = state.emailAddress.trim();
	if (!address) return { ok: false, error: '请输入邮箱地址。' };
	const params = new URLSearchParams();
	if (state.emailSubject.trim()) params.set('subject', state.emailSubject.trim());
	if (state.emailBody.trim()) params.set('body', state.emailBody.trim());
	const query = params.toString();
	return { ok: true, content: `mailto:${address}${query ? `?${query}` : ''}`, label: '邮箱' };
}

function buildPhoneContent(value: string): QrContentResult {
	const phone = value.trim();
	if (!phone) return { ok: false, error: '请输入电话号码。' };
	return { ok: true, content: `tel:${phone}`, label: '电话' };
}

function buildSmsContent(phoneValue: string, bodyValue: string): QrContentResult {
	const phone = phoneValue.trim();
	if (!phone) return { ok: false, error: '请输入短信号码。' };
	const body = bodyValue.trim();
	return { ok: true, content: `SMSTO:${phone}:${body}`, label: '短信' };
}

function escapeWifiValue(value: string): string {
	return value.replace(/([\\;,":])/g, '\\$1');
}

function escapeVCardValue(value: string): string {
	return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}
