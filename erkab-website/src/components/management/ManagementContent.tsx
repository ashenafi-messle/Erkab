'use client';

import React from 'react';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import { MANAGEMENT_MEMBERS } from '@/lib/constants/management';
import { ManagementCard } from './ManagementCard';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function ManagementContent() {
  const { t } = useLanguage();

  return (
    <main id="main-content" tabIndex={-1}>
      <PageHero
        badge={t.managementPage.heroBadge}
        title={t.managementPage.heroTitle}
        description={t.managementPage.heroDesc}
      />

      <section className="section-py management-section" aria-label={t.managementPage.heroTitle}>
        <Container>
          <div className="row g-4">
            {MANAGEMENT_MEMBERS.map((member, index) => (
              <div key={member.id} className="col-12 col-md-6 col-lg-4">
                <ManagementCard member={member} priority={index < 3} />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
