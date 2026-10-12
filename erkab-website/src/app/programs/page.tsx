import { Metadata } from 'next';
import { ProgramsContent } from '@/components/programs/ProgramsContent';

export const metadata: Metadata = {
  title: 'Training Programs | Erkab Skills Training Organization',
  description:
    'Explore 10 comprehensive vocational training programs in Gondar, Ethiopia: Software Development, AI, Data Science, Cybersecurity, AgTech, and more.',
};

export default function ProgramsPage() {
  return <ProgramsContent />;
}
