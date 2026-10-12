import { MetadataRoute } from 'next';
import { PROGRAMS } from '@/lib/constants/programs';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://erkab.org';

  const staticRoutes = [
    '',
    '/about',
    '/programs',
    '/apply',
    '/apply/student',
    '/apply/trainer',
    '/tutoring',
    '/partnerships',
    '/donations',
    '/news',
    '/contact',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const programRoutes = PROGRAMS.map((p) => ({
    url: `${baseUrl}/programs/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...programRoutes];
}
