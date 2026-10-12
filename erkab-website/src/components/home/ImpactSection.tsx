'use client';

import React from 'react';
import { Container } from '../layout/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function ImpactSection() {
  const { t } = useLanguage();

  return (
    <section className="section-py section-bg-light">
      <Container>
        <SectionHeading
          tag={t.impact.tag}
          title={t.impact.heading}
          subtitle={t.impact.subheading}
          tagColor="blue"
        />

        <div className="impact-panel">
          <div className="row g-4">
            {/* Highlight 1: Lime Card */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="impact-card-lime">
                <div className="impact-value text-dark">{t.impact.stat2Number}</div>
                <div className="impact-label">{t.impact.stat2Label}</div>
                <p className="impact-desc text-dark-50">{t.impact.stat2Desc}</p>
              </div>
            </div>

            {/* Highlight 2: White Card */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="impact-card-white">
                <div className="impact-value text-primary">{t.impact.stat1Number}</div>
                <div className="impact-label">{t.impact.stat1Label}</div>
                <p className="impact-desc">{t.impact.stat1Desc}</p>
              </div>
            </div>

            {/* Highlight 3: White Card */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="impact-card-white">
                <div className="impact-value text-primary">{t.impact.stat3Number}</div>
                <div className="impact-label">{t.impact.stat3Label}</div>
                <p className="impact-desc">{t.impact.stat3Desc}</p>
              </div>
            </div>

            {/* Highlight 4: White Card */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="impact-card-white">
                <div className="impact-value text-primary">{t.impact.stat4Number}</div>
                <div className="impact-label">{t.impact.stat4Label}</div>
                <p className="impact-desc">{t.impact.stat4Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
