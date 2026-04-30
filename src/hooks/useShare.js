import { useCallback, useState } from 'react';

export function useShare() {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async (post) => {
    const url   = `${window.location.origin}/video/${post.id}`;
    const title = post.product_name ?? 'Check this out on Shop29';
    const text  = post.description ?? '';

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // user cancelled — not an error
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Last resort: prompt
      window.prompt('Copy this link:', url);
    }
  }, []);

  return { share, copied };
}
