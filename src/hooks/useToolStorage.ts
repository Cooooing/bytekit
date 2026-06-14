import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

type SetState<T> = Dispatch<SetStateAction<T>>;

export function useToolStorage<T>(key: string, initialState: T): [T, SetState<T>] {
	const [state, setState] = useState<T>(() => {
		if (typeof window === 'undefined') return initialState;

		try {
			const stored = window.localStorage.getItem(key);
			return stored ? { ...initialState, ...JSON.parse(stored) } : initialState;
		} catch {
			return initialState;
		}
	});

	useEffect(() => {
		try {
			window.localStorage.setItem(key, JSON.stringify(state));
		} catch {
			// 本地存储不可用时忽略，工具仍可正常使用。
		}
	}, [key, state]);

	return [state, setState];
}
