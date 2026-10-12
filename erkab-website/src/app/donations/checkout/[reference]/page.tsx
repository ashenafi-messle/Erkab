import { DonationCheckoutClient } from '@/components/donations/DonationCheckoutClient';

interface DonationCheckoutPageProps {
  params: Promise<{ reference: string }>;
}

export const instant = false;

export default async function DonationCheckoutPage({ params }: DonationCheckoutPageProps) {
  const { reference } = await params;
  return <DonationCheckoutClient paymentReference={reference} />;
}
