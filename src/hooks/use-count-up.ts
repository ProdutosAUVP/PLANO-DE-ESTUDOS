import { useEffect, useRef, useState } from "react";

/** Anima um número de 0 (ou do valor anterior) até `target` em `duration` ms, com ease-out. */
export function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (target - from) * eased;
      setValue(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      fromRef.current = target;
    };
  }, [target, duration]);

  return value;
}
