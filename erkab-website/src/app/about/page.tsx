import { Metadata } from 'next';
import { AboutContent } from '@/components/about/AboutContent';
import { BRANDING } from '@/lib/constants/branding';

export const metadata: Metadata = {
  title: `About Us | ${BRANDING.officialName}`,
  description:
    `Learn about ${BRANDING.officialName} in Gondar, Ethiopia. Our mission is to bridge education and market-driven vocational skills for youth.`,
};

export default function AboutPage() {
  return <AboutContent />;
}
