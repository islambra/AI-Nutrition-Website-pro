import { useEffect, useRef } from 'react';

export function useAbort() {
  const controllerRef = useRef(new AbortController());

  useEffect(() => {
    const controller = controllerRef.current;
    return () => controller.abort();
  }, []);

  const getSignal = () => {
    if (controllerRef.current.signal.aborted) {
      controllerRef.current = new AbortController();
    }
    return controllerRef.current.signal;
  };

  return { signal: controllerRef.current.signal, getSignal };
}
