import { useEffect, useState } from 'react';
import type ShowTools from '@/types/show_tools';

/** How long a closed panel stays mounted, so the native sheet can slide away first. */
const EXIT_DURATION = 400;

/** Open state for one overlay (used by `withOverlay`). */
export default function useShow(): ShowTools {
  const [state, setState] = useState<ShowTools['state']>('');

  useEffect(() => {
    if (state !== 'close') return;
    const timer = setTimeout(() => setState(''), EXIT_DURATION);
    return () => clearTimeout(timer);
  }, [state]);

  return {
    state,
    open: () => setState('active'),
    close: () => setState((current) => (current === 'active' ? 'close' : current)),
  };
}
