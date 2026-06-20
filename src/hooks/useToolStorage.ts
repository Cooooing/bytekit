import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

type SetState<T> = Dispatch<SetStateAction<T>>;

export function useToolStorage<T>(key: string, initialState: T): [T, SetState<T>] {
	const [state, setState] = useState<T>(initialState);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		try {
			const stored = window.localStorage.getItem(key);
			setState(stored ? { ...initialState, ...JSON.parse(stored) } : initialState);
		} catch {
			setState(initialState);
		} finally {
			setIsLoaded(true);
		}
		// 只在 key 变化时恢复本地状态；initialState 通常是组件内联对象。
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key]);

	useEffect(() => {
		if (!isLoaded) return;
		try {
			window.localStorage.setItem(key, JSON.stringify(state));
		} catch {
			// 本地存储不可用时忽略，工具仍可正常使用。
		}
	}, [isLoaded, key, state]);

	return [state, setState];
}
