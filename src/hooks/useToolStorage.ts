import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

type SetState<T> = Dispatch<SetStateAction<T>>;

export function useToolStorage<T>(key: string, initialState: T): [T, SetState<T>] {
	const [state, setState] = useState<T>(initialState);
	const [isLoaded, setIsLoaded] = useState(false);
	const lastSerializedRef = useRef('');

	useEffect(() => {
		try {
			const stored = window.localStorage.getItem(key);
			lastSerializedRef.current = stored ?? '';
			setState(stored ? { ...initialState, ...JSON.parse(stored) } : initialState);
		} catch {
			lastSerializedRef.current = '';
			setState(initialState);
		} finally {
			setIsLoaded(true);
		}
		// 只在 key 变化时恢复本地状态；initialState 通常是组件内联对象。
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key]);

	useEffect(() => {
		if (!isLoaded) return;
		let serialized: string;
		try {
			serialized = JSON.stringify(state);
		} catch {
			return;
		}
		if (serialized === lastSerializedRef.current) return;

		const timer = window.setTimeout(() => {
			try {
				window.localStorage.setItem(key, serialized);
				lastSerializedRef.current = serialized;
			} catch {
				// 本地存储不可用时忽略，工具仍可正常使用。
			}
		}, 350);

		return () => window.clearTimeout(timer);
	}, [isLoaded, key, state]);

	return [state, setState];
}
