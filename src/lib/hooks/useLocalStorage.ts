import { useCallback, useState } from 'react';

/**
 * A hook to use local storage with React.
 */
export const useLocalStorage = <T>(
	key: string,
	initialValue: T
): [T, (value: T) => void] => {
	const [storedValue, setStoredValue] = useState<T>(() => {
		if (typeof window !== 'undefined') {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		}
		return initialValue;
	});

	const setValue = useCallback(
		(value: T) => {
			setStoredValue(value);
			if (typeof window !== 'undefined') {
				window.localStorage.setItem(key, JSON.stringify(value));
			}
		},
		[key]
	);

	return [storedValue, setValue];
};
