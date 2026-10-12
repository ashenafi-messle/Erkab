'use client';

import { useEffect } from 'react';
import { Container } from '@/components/layout/Container';
import { ErrorState } from '@/components/ui/ErrorState';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="section-py">
      <Container>
        <div className="mx-auto" style={{ maxWidth: '600px' }}>
          <ErrorState
            title="An unexpected error occurred"
            message={error.message || 'Something went wrong while rendering this page.'}
            onRetry={reset}
          />
        </div>
      </Container>
    </div>
  );
}
