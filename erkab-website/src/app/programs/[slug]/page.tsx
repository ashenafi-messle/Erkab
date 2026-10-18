import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProgramBySlug, getPrograms } from '@/features/programs/service';
import { ProgramDetailContent } from '@/components/programs/ProgramDetailContent';

interface ProgramDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const programs = await getPrograms();
  return programs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: ProgramDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) {
    return { title: 'Program Not Found | Erkab Skills Training Organization' };
  }
  return {
    title: `${program.title} | Erkab Training Programs`,
    description: program.summary,
  };
}

async function ProgramData({ slug }: { slug: string }) {
  const program = await getProgramBySlug(slug);
  if (!program) {
    notFound();
  }
  return <ProgramDetailContent initialProgram={program} />;
}

export default async function ProgramDetailPage({ params }: ProgramDetailProps) {
  const { slug } = await params;
  return (
    <Suspense
      fallback={
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary my-5" role="status">
            <span className="visually-hidden">Loading curriculum details...</span>
          </div>
        </div>
      }
    >
      <ProgramData slug={slug} />
    </Suspense>
  );
}
