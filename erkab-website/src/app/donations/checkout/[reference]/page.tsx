import React, { Suspense } from 'react';
import { DonationCheckoutClient } from '@/components/donations/DonationCheckoutClient';

interface DonationCheckoutPageProps {
  params: Promise<{ reference: string }>;
}

export const instant = false;

export const metadata = {
  title: 'Donation Bank Transfer Instructions | Erkab Skills Training Organization',
  description: 'Official Dashen Bank transfer instructions for donations to Erkab Skills Training Organization.',
};

export default async function DonationCheckoutByReferencePage({ params }: DonationCheckoutPageProps) {
  const { reference } = await params;
  return (
    <Suspense
      fallback={
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      }
    >
      <DonationCheckoutClient paymentReference={reference} />
    </Suspense>
  );
}
