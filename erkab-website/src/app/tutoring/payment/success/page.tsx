import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { SuccessRedirectClient } from '@/features/tutoring/components/SuccessRedirectClient';

export const instant = false;

interface PageProps {
  searchParams: Promise<{ paymentRef?: string; ref?: string }>;
}

export default async function GenericPaymentSuccessPage({ searchParams }: PageProps) {
  const { paymentRef, ref } = await searchParams;
  const targetRef = paymentRef || ref;

  return (
    <Suspense
      fallback={
        <div className="min-vh-50 d-flex flex-column align-items-center justify-content-center py-5">
          <Loader2 size={36} className="text-primary spinner-border spinner-border-sm mb-3" />
          <p className="text-muted small">Loading...</p>
        </div>
      }
    >
      <SuccessRedirectClient targetRef={targetRef} />
    </Suspense>
  );
}
