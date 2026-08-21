'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RollDetailRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/job-work');
  }, [router]);

  return null;
}
