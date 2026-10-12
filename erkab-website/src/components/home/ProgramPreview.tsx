'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '../layout/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { ProgramGrid } from '../programs/ProgramGrid';
import { PROGRAMS } from '@/lib/constants/programs';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ArrowRight } from 'lucide-react';

export function ProgramPreview() {
  const { t } = useLanguage();
  // Curate 4 high-impact, diverse tracks for the homepage to prevent excessive scrolling
  const featuredPrograms = PROGRAMS.slice(0, 4);

  return (
    <section className="section-py section-bg-light" id="programs">
      <Container>
        <SectionHeading
          tag={t.programs.tag}
          title={t.programs.heading}
          subtitle={t.programs.subheading}
          tagColor="cyan"
        />

        <ProgramGrid programs={featuredPrograms} />

        <div className="text-center mt-4 pt-2">
          <Link href="/programs" className="btn-erkab btn-erkab-primary">
            <span>{t.programs.viewAll}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
