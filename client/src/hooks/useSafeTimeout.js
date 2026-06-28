import { useEffect, useRef, useCallback } from 'react';

export function useSafeTimeout() {
  const timersRef = useRef(new Set());

  const setTimeoutSafe = useCallback((fn, delay) => {
    const id = setTimeout(() => {
      timersRef.current.delete(id);
      fn();
    }, delay);
    timersRef.current.add(id);
    return id;
  }, []);

  const clearTimeoutSafe = useCallback((id) => {
    if (id != null && timersRef.current.has(id)) {
      clearTimeout(id);
      timersRef.current.delete(id);
    }
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const id of timers) clearTimeout(id);
      timers.clear();
    };
  }, []);

  return { setTimeoutSafe, clearTimeoutSafe };
}
