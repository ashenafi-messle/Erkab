import { Metadata } from 'next';
import { PrivacyContent } from '@/components/legal/PrivacyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy | Erkab Skills Training Organization',
  description:
    'Privacy Policy of Erkab Skills Training Organization regarding student applicant data, national identification security, and records retention.',
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
