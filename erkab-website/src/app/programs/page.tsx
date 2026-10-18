import { Suspense } from 'react';
import { Metadata } from 'next';
import { ProgramsContent } from '@/components/programs/ProgramsContent';
import { getPrograms } from '@/features/programs/service';

export const metadata: Metadata = {
  title: 'Training Programs | Erkab Skills Training Organization',
  description:
    'Explore comprehensive vocational training programs in Gondar, Ethiopia: Software Development, AI, Data Science, Cybersecurity, AgTech, and more.',
};

async function ProgramsData() {
  const programs = await getPrograms();
  return <ProgramsContent initialPrograms={programs} />;
}

export default function ProgramsPage() {
  return (
    <Suspense fallback={<ProgramsContent initialPrograms={[]} />}>
      <ProgramsData />
    </Suspense>
  );
}
