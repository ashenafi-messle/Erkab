import type { Metadata, Viewport } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

export const metadata: Metadata = {
  title: 'Erkab Skills Training Organization | From Skills to Opportunity',
  description:
    'Erkab Skills Training Organization in Gondar, Ethiopia empowers young people through practical technology training, scholarships, entrepreneurship, and digital employment preparation.',
  keywords: [
    'Erkab Skills Training Organization',
    'Erkab Edtech',
    'Gondar Ethiopia',
    'Tech Training Ethiopia',
    'Vocational Skills',
    'Web Development Bootcamp',
    'AI Training Gondar',
    'Scholarship Tech Program',
    'Digital Employment',
  ],
  authors: [{ name: 'Erkab Skills Training Organization' }],
  metadataBase: new URL('https://erkab.org'),
  openGraph: {
    title: 'Erkab Skills Training Organization | From Skills to Opportunity',
    description:
      'Global Standards. Local Impact. Vocational Excellence in Gondar, Ethiopia.',
    url: 'https://erkab.org',
    siteName: 'Erkab Skills Training Organization',
    locale: 'en_US',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <SiteHeader />
          <main id="main-content" style={{ minHeight: '80vh' }}>
            {children}
          </main>
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
