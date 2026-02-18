import { useState, useEffect, useCallback } from 'react';

/**
 * Persist state to localStorage. Key must be unique.
 * @param {string} key - localStorage key
 * @param {*} initialValue - value when no stored value exists
 * @returns {[*, function]} [value, setValue]
 */
export function useStorage(key, initialValue) {
  const [value, setValueState] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (next) => {
      setValueState((prev) => {
        const nextValue = typeof next === 'function' ? next(prev) : next;
        try {
          if (nextValue == null) {
            localStorage.removeItem(key);
          } else {
            localStorage.setItem(key, JSON.stringify(nextValue));
          }
        } catch (e) {
          console.warn('useStorage: failed to persist', key, e);
        }
        return nextValue;
      });
    },
    [key]
  );

  // Sync across tabs
  useEffect(() => {
    const handler = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValueState(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key]);

  return [value, setValue];
}
