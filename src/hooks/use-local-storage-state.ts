import { useEffect, useState } from "react";

export function useLocalStorageState<T>(
  storageKey: string,
  initialValue: T,
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = window.localStorage.getItem(storageKey);

    if (!stored) {
      return initialValue;
    }

    try {
      return JSON.parse(stored) as T;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  }, [storageKey, value]);

  return [value, setValue];
}
