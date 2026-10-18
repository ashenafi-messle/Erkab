import React, { Suspense } from 'react';
import { DonationCheckoutClient } from '@/components/donations/DonationCheckoutClient';

export const instant = false;

export const metadata = {
  title: 'Donation Bank Transfer Instructions | Erkab Skills Training Organization',
  description: 'Official Dashen Bank transfer instructions for donations to Erkab Skills Training Organization.',
};

export default function DonationCheckoutPage() {
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
      <DonationCheckoutClient />
    </Suspense>
  );
}
