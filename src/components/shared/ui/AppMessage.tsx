import * as Toast from '@radix-ui/react-toast';
import { AlertCircle, CheckCircle2, Info, X, type LucideIcon } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

type MessageType = 'success' | 'info' | 'warning' | 'error';

interface MessageOptions {
	duration?: number;
	closable?: boolean;
}

interface MessageItem {
	id: number;
	type: MessageType;
	text: string;
	duration: number;
	closable: boolean;
}

interface MessageEventDetail {
	type: MessageType;
	text: string;
	options?: MessageOptions;
}

interface MessageApi {
	success: (text: string, options?: MessageOptions) => void;
	info: (text: string, options?: MessageOptions) => void;
	warning: (text: string, options?: MessageOptions) => void;
	error: (text: string, options?: MessageOptions) => void;
}

const MessageContext = createContext<MessageApi | null>(null);
const defaultDuration = 3000;
const maxMessages = 5;
const messageEventName = 'bytekit:app-message';

const iconMap: Record<MessageType, LucideIcon> = {
	success: CheckCircle2,
	info: Info,
	warning: AlertCircle,
	error: AlertCircle,
};

function emitGlobalMessage(type: MessageType, text: string, options?: MessageOptions) {
	if (typeof window === 'undefined') return;
	window.dispatchEvent(new CustomEvent<MessageEventDetail>(messageEventName, {
		detail: { type, text, options },
	}));
}

const globalMessageApi: MessageApi = {
	success: (text, options) => emitGlobalMessage('success', text, options),
	info: (text, options) => emitGlobalMessage('info', text, options),
	warning: (text, options) => emitGlobalMessage('warning', text, options),
	error: (text, options) => emitGlobalMessage('error', text, options),
};

export function AppMessageProvider({ children }: { children: ReactNode }) {
	const [items, setItems] = useState<MessageItem[]>([]);
	const nextId = useRef(1);

	const close = useCallback((id: number) => {
		setItems((current) => current.filter((item) => item.id !== id));
	}, []);

	const show = useCallback((type: MessageType, text: string, options?: MessageOptions) => {
		const normalized = text.trim();
		if (!normalized) return;
		const id = nextId.current;
		nextId.current += 1;
		const item: MessageItem = {
			id,
			type,
			text: normalized,
			duration: options?.duration ?? defaultDuration,
			closable: options?.closable ?? true,
		};
		setItems((current) => [...current, item].slice(-maxMessages));
	}, []);

	useEffect(() => {
		const handler = (event: Event) => {
			const detail = (event as CustomEvent<MessageEventDetail>).detail;
			if (!detail) return;
			show(detail.type, detail.text, detail.options);
		};
		window.addEventListener(messageEventName, handler);
		return () => window.removeEventListener(messageEventName, handler);
	}, [show]);

	const api = useMemo<MessageApi>(() => ({
		success: (text, options) => show('success', text, options),
		info: (text, options) => show('info', text, options),
		warning: (text, options) => show('warning', text, options),
		error: (text, options) => show('error', text, options),
	}), [show]);

	return (
		<MessageContext.Provider value={api}>
			<Toast.Provider swipeDirection="up" duration={defaultDuration}>
				{children}
				<Toast.Viewport className="app-toast-viewport" />
				{items.map((item) => {
					const Icon = iconMap[item.type];
					return (
						<Toast.Root
							key={item.id}
							className={`app-toast app-toast--${item.type}`}
							duration={item.duration}
							open
							onOpenChange={(open) => {
								if (!open) close(item.id);
							}}
						>
							<Icon className="app-toast__icon" size={18} strokeWidth={2.2} aria-hidden="true" />
							<Toast.Title className="app-toast__text">{item.text}</Toast.Title>
							{item.closable ? (
								<Toast.Close className="app-toast__close" aria-label="关闭消息">
									<X size={15} strokeWidth={2.2} aria-hidden="true" />
								</Toast.Close>
							) : null}
						</Toast.Root>
					);
				})}
			</Toast.Provider>
		</MessageContext.Provider>
	);
}

export function useAppMessage(): MessageApi {
	const context = useContext(MessageContext);
	return context ?? globalMessageApi;
}

export function useMessageOnError(error: string | undefined, delay = 300) {
	const message = useAppMessage();
	const lastError = useRef('');

	useEffect(() => {
		if (!error) {
			lastError.current = '';
			return;
		}
		const timer = window.setTimeout(() => {
			if (error !== lastError.current) {
				message.error(error);
				lastError.current = error;
			}
		}, delay);
		return () => window.clearTimeout(timer);
	}, [delay, error, message]);
}
