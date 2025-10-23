
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientSessionCheck() {
  const router = useRouter();

  useEffect(() => {
    // This check runs only on the client-side
    if (!sessionStorage.getItem('user') || !sessionStorage.getItem('clinicId')) {
      router.push('/login');
    }
  }, [router]);

  return null; // This component doesn't render anything
}
