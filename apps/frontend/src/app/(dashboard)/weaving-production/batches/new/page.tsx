'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    router.replace(`/job-work/weaving/new?${searchParams.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="p-8 text-center text-muted-foreground font-mono text-sm">
      Routing to Weaving Order Setup...
    </div>
  );
}

export default function WeavingBatchNewRedirectPage() {
  return (
    <Suspense fallback={null}>
      <RedirectContent />
    </Suspense>
  );
}
