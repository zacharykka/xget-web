import { useCallback, useEffect, useRef, useState, useTransition } from "react";

interface CopyOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseCopyToClipboardResult {
  copied: boolean;
  isPending: boolean;
  copy: (text: string, options?: CopyOptions) => Promise<void>;
}

export function useCopyToClipboard(): UseCopyToClipboardResult {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const resetTimer = useRef<number | null>(null);

  const clearResetTimer = useCallback(() => {
    if (resetTimer.current !== null) {
      window.clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
  }, []);

  useEffect(() => clearResetTimer, [clearResetTimer]);

  const copy = useCallback<UseCopyToClipboardResult["copy"]>(
    async (text, options) => {
      try {
        await navigator.clipboard.writeText(text);
        startTransition(() => {
          setCopied(true);
          clearResetTimer();
          resetTimer.current = window.setTimeout(() => {
            setCopied(false);
            resetTimer.current = null;
          }, 2000);
        });
        options?.onSuccess?.();
      } catch (error) {
        options?.onError?.(error as Error);
        throw error;
      }
    },
    [clearResetTimer]
  );

  return { copied, isPending, copy };
}
