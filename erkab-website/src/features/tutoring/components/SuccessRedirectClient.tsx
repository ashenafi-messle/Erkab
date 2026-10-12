'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function SuccessRedirectClient({ targetRef }: { targetRef?: string }) {
  const router = useRouter();

  useEffect(() => {
    if (targetRef) {
      router.replace(`/tutoring/payment/${targetRef}/success`);
    } else {
      router.replace('/tutoring');
    }
  }, [targetRef, router]);

  return (
    <div className="min-vh-50 d-flex flex-column align-items-center justify-content-center py-5">
      <Loader2 size={36} className="text-primary spinner-border spinner-border-sm mb-3" />
      <p className="text-muted small">Redirecting to verified payment confirmation...</p>
    </div>
  );
}
