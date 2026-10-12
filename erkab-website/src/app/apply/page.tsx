import { Metadata } from 'next';
import { ApplyLandingContent } from '@/components/apply/ApplyLandingContent';

export const metadata: Metadata = {
  title: 'Apply Now | Erkab Skills Training Organization',
  description:
    'Apply for Erkab tuition-free student scholarship cohorts or apply to become a certified trainer/mentor in Gondar, Ethiopia.',
};

export default function ApplyLandingPage() {
  return <ApplyLandingContent />;
}
