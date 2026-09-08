'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // If the error is a ChunkLoadError (caused by new deployments or HMR code updates),
    // automatically reload once to fetch the latest assets seamlessly.
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('ChunkLoadError') ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Failed to fetch dynamically imported module');

    if (isChunkError && typeof window !== 'undefined') {
      const storageKey = 'last_chunk_reload_ts';
      const lastReload = sessionStorage.getItem(storageKey);
      const now = Date.now();
      // Guard against infinite reload loops (only reload if not done within the last 10 seconds)
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem(storageKey, now.toString());
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">Application Updated</h2>
      <p className="text-xs text-muted-foreground max-w-md mb-6">
        New code changes or updated modules were detected. Please reload the page to load the latest version.
      </p>
      <div className="flex items-center gap-3">
        <Button
          onClick={() => {
            if (typeof window !== 'undefined') window.location.reload();
          }}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <RotateCcw className="h-4 w-4" />
          Reload Page
        </Button>
        <Button variant="outline" onClick={() => reset()}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
