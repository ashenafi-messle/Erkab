import { Suspense } from 'react';
import { PaymentSuccessClient } from '@/features/tutoring/components/PaymentSuccessClient';
import { Loader2 } from 'lucide-react';

export const instant = false;

interface PageProps {
  params: Promise<{ reference: string }>;
}

export default async function PaymentSuccessPage({ params }: PageProps) {
  const { reference } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-vh-50 d-flex flex-column align-items-center justify-content-center py-5">
          <Loader2 size={36} className="text-primary spinner-border spinner-border-sm mb-3" />
          <p className="text-muted small">Loading verification details...</p>
        </div>
      }
    >
      <PaymentSuccessClient reference={reference} />
    </Suspense>
  );
}
