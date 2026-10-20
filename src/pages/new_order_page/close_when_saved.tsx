import { useEffect } from 'react';

/** Closes the order sheet once the order is saved, before the screen goes back to the board. */
export default function CloseWhenSaved({ saved, close }: { saved: boolean; close: () => void }) {
  useEffect(() => {
    if (saved) close();
  }, [saved, close]);
  return null;
}
