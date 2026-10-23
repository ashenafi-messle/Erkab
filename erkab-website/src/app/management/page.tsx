import { Metadata } from 'next';
import { ManagementContent } from '@/components/management/ManagementContent';
import { BRANDING } from '@/lib/constants/branding';

export const metadata: Metadata = {
  title: `Our Management | ${BRANDING.officialName}`,
  description:
    'Meet the leadership and management team working to advance skills development, educational opportunities, and organizational excellence at Erkab.',
  openGraph: {
    title: `Our Management | ${BRANDING.officialName}`,
    description:
      'Meet the leadership and management team working to advance skills development, educational opportunities, and organizational excellence at Erkab.',
  },
};

export default function ManagementPage() {
  return <ManagementContent />;
}
