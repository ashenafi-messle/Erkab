import { Metadata } from 'next';
import { TermsContent } from '@/components/legal/TermsContent';

export const metadata: Metadata = {
  title: 'Terms of Service | Erkab Skills Training Organization',
  description:
    'Terms and Conditions for website usage, cohort applications, and participation in Erkab Skills Training Organization programs.',
};

export default function TermsPage() {
  return <TermsContent />;
}
