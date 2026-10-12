import { Metadata } from 'next';
import { getAnnouncements } from '@/features/announcements/service';
import { NewsContent } from '@/components/news/NewsContent';

export const metadata: Metadata = {
  title: 'News & Announcements | Erkab Skills Training Organization',
  description:
    'Stay updated with the latest news, cohort application dates, and event announcements from Erkab Skills Training Organization in Gondar.',
};

export default async function NewsPage() {
  const announcements = await getAnnouncements();
  return <NewsContent initialAnnouncements={announcements} />;
}
