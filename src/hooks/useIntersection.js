import { useEffect, useRef } from 'react';

/**
 * Calls `callback` when the returned ref element enters the viewport.
 * Used for triggering infinite-scroll page fetches.
 */
export function useIntersection(callback, { threshold = 0.1, enabled = true } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled || !ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) callback(); },
      { threshold }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [callback, threshold, enabled]);

  return ref;
}
