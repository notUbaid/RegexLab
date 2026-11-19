import { useState } from 'react';

export type CopyStatus = 'idle' | 'copied' | 'failed';

/** Copies text to the clipboard. `status` says 'copied' or 'failed' for 1.5s so a button can show it. */
export function useCopy() {
  const [status, setStatus] = useState<CopyStatus>('idle');

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
    } catch {
      // The clipboard is missing on non-https pages, and the browser can also refuse.
      setStatus('failed');
    }
    setTimeout(() => setStatus('idle'), 1500);
  }

  return { status, copy };
}

export function copyLabel(status: CopyStatus, label: string) {
  if (status === 'copied') return 'Copied';
  if (status === 'failed') return 'Copy failed';
  return label;
}
