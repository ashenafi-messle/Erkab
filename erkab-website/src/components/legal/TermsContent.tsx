'use client';

import React from 'react';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function TermsContent() {
  const { t } = useLanguage();

  return (
    <>
      <PageHero
        badge={t.legalPages.termsBadge}
        title={t.legalPages.termsTitle}
        description={t.legalPages.termsDesc}
      />

      <section className="section-py section-bg-white pt-0">
        <Container>
          <div className="mx-auto text-start" style={{ maxWidth: '820px', lineHeight: '1.75' }}>
            <h2 className="h5 fw-bold text-dark mb-3">{t.legalPages.tSec1Title}</h2>
            <p className="text-muted small mb-4">
              {t.legalPages.tSec1Desc}
            </p>

            <h2 className="h5 fw-bold text-dark mb-3">{t.legalPages.tSec2Title}</h2>
            <p className="text-muted small mb-4">
              {t.legalPages.tSec2Desc}
            </p>

            <h2 className="h5 fw-bold text-dark mb-3">{t.legalPages.tSec3Title}</h2>
            <p className="text-muted small mb-4">
              {t.legalPages.tSec3Desc}
            </p>

            <h2 className="h5 fw-bold text-dark mb-3">{t.legalPages.tSec4Title}</h2>
            <p className="text-muted small mb-4">
              {t.legalPages.tSec4Desc}
            </p>

            <h2 className="h5 fw-bold text-dark mb-3">{t.legalPages.tSec5Title}</h2>
            <p className="text-muted small mb-0">
              {t.legalPages.tSec5Desc}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
