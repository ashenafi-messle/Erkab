'use client';

import React from 'react';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function PrivacyContent() {
  const { t } = useLanguage();

  return (
    <>
      <PageHero
        badge={t.legalPages.privacyBadge}
        title={t.legalPages.privacyTitle}
        description={t.legalPages.privacyDesc}
      />

      <section className="section-py section-bg-white pt-0">
        <Container>
          <div className="mx-auto text-start" style={{ maxWidth: '820px', lineHeight: '1.75' }}>
            <h2 className="h5 fw-bold text-dark mb-3">{t.legalPages.sec1Title}</h2>
            <p className="text-muted small mb-4">
              {t.legalPages.sec1Desc}
            </p>

            <h2 className="h5 fw-bold text-dark mb-3">{t.legalPages.sec2Title}</h2>
            <p className="text-muted small mb-4">
              {t.legalPages.sec2Desc}
            </p>

            <h2 className="h5 fw-bold text-dark mb-3">{t.legalPages.sec3Title}</h2>
            <p className="text-muted small mb-4">
              {t.legalPages.sec3Desc}
            </p>

            <h2 className="h5 fw-bold text-dark mb-3">{t.legalPages.sec4Title}</h2>
            <p className="text-muted small mb-4">
              {t.legalPages.sec4Desc}
            </p>

            <h2 className="h5 fw-bold text-dark mb-3">{t.legalPages.sec5Title}</h2>
            <p className="text-muted small mb-0">
              {t.legalPages.sec5Desc}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
