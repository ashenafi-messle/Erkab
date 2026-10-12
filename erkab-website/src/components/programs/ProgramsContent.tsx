'use client';

import React from 'react';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import { ProgramCard } from '@/components/programs/ProgramCard';
import { TechnologyShowcase } from '@/components/home/TechnologyShowcase';
import { PROGRAMS } from '@/lib/constants/programs';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function ProgramsContent() {
  const { t } = useLanguage();

  return (
    <>
      <PageHero
        badge={t.programsPage.heroBadge}
        title={t.programsPage.heroTitle}
        description={t.programsPage.heroDesc}
      />

      <section className="section-py section-bg-white pt-0">
        <Container>
          <div className="row g-4 mb-5">
            {PROGRAMS.map((program) => (
              <div key={program.id} className="col-12 col-md-6 col-lg-4">
                <ProgramCard program={program} />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Advanced AI & Technology Lab Showcase */}
      <TechnologyShowcase />
    </>
  );
}
