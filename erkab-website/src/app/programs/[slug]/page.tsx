import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PROGRAMS } from '@/lib/constants/programs';
import { ProgramDetailContent } from '@/components/programs/ProgramDetailContent';

interface ProgramDetailProps {
  params: Promise<{ slug: string }>;
}

export const instant = false;

export async function generateStaticParams() {
  return PROGRAMS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: ProgramDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const program = PROGRAMS.find((p) => p.slug === slug);
  if (!program) {
    return { title: 'Program Not Found | Erkab Skills Training Organization' };
  }
  return {
    title: `${program.title} | Erkab Training Programs`,
    description: program.summary,
  };
}

export default async function ProgramDetailPage({ params }: ProgramDetailProps) {
  const { slug } = await params;
  const program = PROGRAMS.find((p) => p.slug === slug);

  if (!program) {
    notFound();
  }

  return <ProgramDetailContent initialProgram={program} />;
}
