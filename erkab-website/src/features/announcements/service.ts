import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface Announcement {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  content: string;
  coverImageUrl?: string | null;
  isImportant?: boolean;
}

const FALLBACK_ARTICLES: Announcement[] = [
  {
    id: 'ann-1',
    slug: 'scholarship-cohort-1-announcement',
    title: 'Applications Open for Inaugural 12-Week Vocational Cohorts',
    date: '2026-10-10',
    category: 'Admissions',
    summary: 'Erkab Skills Training Organization announces the commencement of student scholarship applications across all 10 training tracks.',
    content: 'We welcome aspiring software developers, data practitioners, urban agriculture innovators, and craftsmen to review our training tracks and apply for our scholarship program.',
    isImportant: true,
  },
  {
    id: 'ann-2',
    slug: 'sustainable-tech-hub-launch-gondar',
    title: 'Erkab Launches Green Energy Tech Learning Center in Gondar',
    date: '2026-10-11',
    category: 'Innovation',
    summary: 'Equipped with solar power and high-speed internet, Erkab unveils a state-of-the-art facility for underserved youth.',
    content: 'Our new technology hub in Gondar brings modern compute resources, renewable energy, and hands-on laboratory stations to ambitious youth across the Amhara region.',
    isImportant: true,
  },
];

export async function getAnnouncements(): Promise<Announcement[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  try {
    const res = await fetch(`${apiUrl}${API_ENDPOINTS.NEWS.LIST}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) {
      return FALLBACK_ARTICLES;
    }
    const json = await res.json();
    if (json.success && Array.isArray(json.data?.articles)) {
      return json.data.articles.map((item: any) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        date: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent',
        category: item.category || 'General',
        summary: item.excerpt || '',
        content: item.content || '',
        coverImageUrl: item.coverImageUrl || null,
      }));
    }
    return FALLBACK_ARTICLES;
  } catch (err) {
    console.warn('Backend news fetch failed, returning fallback:', err);
    return FALLBACK_ARTICLES;
  }
}

export async function getAnnouncementBySlug(slug: string): Promise<Announcement | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  try {
    const res = await fetch(`${apiUrl}${API_ENDPOINTS.NEWS.DETAIL(slug)}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) {
      const found = FALLBACK_ARTICLES.find((a) => a.slug === slug);
      return found || null;
    }
    const json = await res.json();
    if (json.success && json.data) {
      const item = json.data;
      return {
        id: item.id,
        slug: item.slug,
        title: item.title,
        date: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent',
        category: item.category || 'General',
        summary: item.excerpt || '',
        content: item.content || '',
        coverImageUrl: item.coverImageUrl || null,
      };
    }
    return null;
  } catch (err) {
    const found = FALLBACK_ARTICLES.find((a) => a.slug === slug);
    return found || null;
  }
}

export function getLocalizedAnnouncement(ann: Announcement, locale: string): Announcement {
  if (locale !== 'am') return ann;
  if (ann.slug === 'scholarship-cohort-1-announcement') {
    return {
      ...ann,
      title: 'ለመጀመሪያው የ12 ሳምንታት የሙያ ስልጠና ዙር ማመልከቻዎች ተከፍተዋል',
      category: 'ቅበላ እና ምዝገባ',
      summary: 'እርካብ የክህሎት ማሰልጠኛ ድርጅት በሁሉም 10 የስልጠና መስኮች ላይ የተማሪዎች ሙሉ ስኮላርሺፕ ማመልከቻ መጀመሩን ያበስራል።',
      content: 'የሶፍትዌር አልሚዎች፣ የዳታ ባለሙያዎች፣ የከተማ ግብርና ፈጣሪዎች እና የሙያ ባለሙያዎች የስልጠና መስኮቻችንን በመገምገም ለስኮላርሺፕ ፕሮግራማችን እንዲያመለክቱ በደስታ እንጋብዛለን።',
    };
  }
  if (ann.slug === 'sustainable-tech-hub-launch-gondar') {
    return {
      ...ann,
      title: 'እርካብ በጎንደር ዘመናዊ የአረንጓዴ ቴክኖሎጂ ማዕከል ከፈተ',
      category: 'ፈጠራ እና ቴክኖሎጂ',
      summary: 'በፀሐይ ኃይል እና ፈጣን ኢንተርኔት የተሟላው ማዕከል ለወጣቶች የላቀ የሙያ ስልጠና መስጠት ጀምሯል።',
      content: 'በጎንደር ከተማ የተከፈተው አዲሱ የቴክኖሎጂ ማዕከል ዘመናዊ ኮምፒውተሮችን እና የፈጠራ ቤተ-ሙከራዎችን ለአማራ ክልል ወጣቶች ያቀርባል።',
    };
  }
  return ann;
}
