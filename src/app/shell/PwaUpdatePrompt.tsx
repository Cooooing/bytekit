import { useRegisterSW } from 'virtual:pwa-register/react';

export default function PwaUpdatePrompt() {
	const { needRefresh, updateServiceWorker } = useRegisterSW();
	if (!needRefresh[0]) return null;

	return (
		<div className="pwa-update-prompt" role="status" aria-live="polite">
			<span>发现新版本，刷新后生效。</span>
			<button className="ui-button ui-button--secondary ui-button--sm" type="button" onClick={() => void updateServiceWorker(true)}>刷新</button>
			<button className="pwa-update-prompt__close" type="button" aria-label="暂不刷新" onClick={() => needRefresh[1](false)}>关闭</button>
		</div>
	);
}
