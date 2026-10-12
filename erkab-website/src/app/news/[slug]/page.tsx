import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getAnnouncements, getAnnouncementBySlug } from '@/features/announcements/service';
import { NewsDetailContent } from '@/components/news/NewsDetailContent';

interface NewsDetailProps {
  params: Promise<{ slug: string }>;
}

export const instant = false;

export async function generateStaticParams() {
  const list = await getAnnouncements();
  return list.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: NewsDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const found = await getAnnouncementBySlug(slug);
  if (!found) return { title: 'Article Not Found | Erkab Skills Training Organization' };
  return {
    title: `${found.title} | Erkab News`,
    description: found.summary,
  };
}

export default async function NewsDetailPage({ params }: NewsDetailProps) {
  const { slug } = await params;
  const announcement = await getAnnouncementBySlug(slug);

  if (!announcement) {
    notFound();
  }

  return <NewsDetailContent initialAnnouncement={announcement} />;
}
