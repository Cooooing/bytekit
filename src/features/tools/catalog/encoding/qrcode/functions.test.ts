import { describe, expect, it } from 'vitest';
import { buildQrContent, normalizeQrMargin, normalizeQrSize, type QrContentState } from './functions';

const baseState: QrContentState = {
	mode: 'text',
	text: 'Bytekit',
	url: 'https://example.com',
	wifiSsid: 'Office',
	wifiPassword: 'secret',
	wifiEncryption: 'WPA',
	wifiHidden: false,
	contactName: 'Ada Lovelace',
	contactPhone: '+123456',
	contactEmail: 'ada@example.com',
	emailAddress: 'user@example.com',
	emailSubject: 'Hello',
	emailBody: 'World',
	phone: '+123456',
	smsPhone: '+123456',
	smsBody: 'Hi',
};

describe('二维码内容构造', () => {
	it('保留普通文本内容', () => {
		expect(buildQrContent({ ...baseState, mode: 'text', text: ' hello ' })).toMatchObject({ ok: true, content: 'hello' });
	});

	it('构造 URL、Wi-Fi 和联系人内容', () => {
		expect(buildQrContent({ ...baseState, mode: 'url', url: 'https://example.com/a' })).toMatchObject({ ok: true, content: 'https://example.com/a' });
		expect(buildQrContent({ ...baseState, mode: 'wifi' })).toMatchObject({ ok: true, content: 'WIFI:T:WPA;S:Office;P:secret;;' });
		expect(buildQrContent({ ...baseState, mode: 'contact' }).ok).toBe(true);
	});

	it('构造邮箱、电话和短信内容', () => {
		expect(buildQrContent({ ...baseState, mode: 'email' })).toMatchObject({ ok: true, content: 'mailto:user@example.com?subject=Hello&body=World' });
		expect(buildQrContent({ ...baseState, mode: 'phone' })).toMatchObject({ ok: true, content: 'tel:+123456' });
		expect(buildQrContent({ ...baseState, mode: 'sms' })).toMatchObject({ ok: true, content: 'SMSTO:+123456:Hi' });
	});

	it('返回模板输入错误', () => {
		expect(buildQrContent({ ...baseState, mode: 'url', url: 'ftp://example.com' }).ok).toBe(false);
		expect(buildQrContent({ ...baseState, mode: 'wifi', wifiSsid: '' }).ok).toBe(false);
		expect(buildQrContent({ ...baseState, mode: 'contact', contactName: '', contactPhone: '', contactEmail: '' }).ok).toBe(false);
	});

	it('限制二维码尺寸和边距', () => {
		expect(normalizeQrSize(10)).toBe(96);
		expect(normalizeQrSize(2048)).toBe(1024);
		expect(normalizeQrMargin(-1)).toBe(0);
		expect(normalizeQrMargin(20)).toBe(12);
	});
});
