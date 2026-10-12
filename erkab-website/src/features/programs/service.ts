import { PROGRAMS, Program } from '@/lib/constants/programs';

export async function getPrograms(): Promise<Program[]> {
  // During initial static/pre-backend phase, return verified program list
  return PROGRAMS;
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const found = PROGRAMS.find((p) => p.slug === slug);
  return found || null;
}
