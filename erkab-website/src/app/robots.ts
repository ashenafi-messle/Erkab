import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/apply/success'],
    },
    sitemap: 'https://erkab.org/sitemap.xml',
  };
}
