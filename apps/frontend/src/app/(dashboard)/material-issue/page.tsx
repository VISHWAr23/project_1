'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MaterialIssueRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/job-work');
  }, [router]);

  return null;
}
