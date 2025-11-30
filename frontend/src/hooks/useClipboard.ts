import { useState, useCallback } from "react";

export const useClipboard = ({ timeout = 2000 }: { timeout?: number } = {}) => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (value: string) => {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    },
    [timeout]
  );

  return { copy, copied };
};

