export interface Announcement {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: 'Admissions' | 'Event' | 'Community' | 'Notice';
  summary: string;
  content: string;
  isImportant?: boolean;
}

export async function getAnnouncements(): Promise<Announcement[]> {
  return [
    {
      id: 'ann-1',
      slug: 'scholarship-cohort-1-announcement',
      title: 'Applications Open for Inaugural 12-Week Vocational Cohorts',
      date: 'Gondar, Ethiopia',
      category: 'Admissions',
      summary: 'Erkab Skills Training Organization announces the commencement of student scholarship applications across all 10 training tracks.',
      content: 'We welcome aspiring software developers, data practitioners, urban agriculture innovators, and craftsmen to review our training tracks and apply for our scholarship program.',
      isImportant: true,
    },
  ];
}

export function getLocalizedAnnouncement(ann: Announcement, locale: string): Announcement {
  if (locale !== 'am') return ann;
  if (ann.id === 'ann-1') {
    return {
      ...ann,
      title: 'ለመጀመሪያው የ12 ሳምንታት የሙያ ስልጠና ዙር ማመልከቻዎች ተከፍተዋል',
      category: 'Admissions',
      date: 'ጎንደር፣ ኢትዮጵያ',
      summary: 'እርካብ የክህሎት ማሰልጠኛ ድርጅት በሁሉም 10 የስልጠና መስኮች ላይ የተማሪዎች ሙሉ ስኮላርሺፕ ማመልከቻ መጀመሩን ያበስራል።',
      content: 'የሶፍትዌር አልሚዎች፣ የዳታ ባለሙያዎች፣ የከተማ ግብርና ፈጣሪዎች እና የሙያ ባለሙያዎች የስልጠና መስኮቻችንን በመገምገም ለስኮላርሺፕ ፕሮግራማችን እንዲያመለክቱ በደስታ እንጋብዛለን።',
    };
  }
  return ann;
}
