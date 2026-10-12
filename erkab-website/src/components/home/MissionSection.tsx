'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '../layout/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export function MissionSection() {
  const { t } = useLanguage();

  return (
    <section className="section-py section-bg-white">
      <Container>
        <SectionHeading
          tag={t.mission.tag}
          title={t.mission.heading}
          subtitle={t.mission.subheading}
        />

        <div className="row g-5 align-items-center">
          <div className="col-lg-6">
            <div className="pe-lg-4">
              <h3 className="h4 fw-bold mb-3 text-dark">
                {t.mission.heading}
              </h3>
              <p className="text-muted mb-3" style={{ lineHeight: '1.7' }}>
                {t.mission.p1}
              </p>
              <p className="text-muted mb-4" style={{ lineHeight: '1.7' }}>
                {t.mission.p2}
              </p>

              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex align-items-start gap-2">
                  <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <strong className="d-block text-dark">{t.mission.point1Title}</strong>
                    <span className="text-muted small">
                      {t.mission.point1Desc}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-2">
                  <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <strong className="d-block text-dark">{t.mission.point2Title}</strong>
                    <span className="text-muted small">
                      {t.mission.point2Desc}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-2">
                  <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <strong className="d-block text-dark">{t.mission.point3Title}</strong>
                    <span className="text-muted small">
                      {t.mission.point3Desc}
                    </span>
                  </div>
                </div>
              </div>

              <Link href="/about" className="btn-erkab btn-erkab-primary">
                <span>{t.mission.learnMoreBtn}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Balanced Editorial Photographic Showcase */}
          <div className="col-lg-6">
            <div className="position-relative">
              {/* Main Photo Frame */}
              <div
                className="position-relative w-100 rounded-4 overflow-hidden shadow-lg border border-light-subtle"
                style={{ aspectRatio: '16 / 11', backgroundColor: '#071927' }}
              >
                <Image
                  src="/images/organization/students-learning.jpg"
                  alt="Ethiopian students collaborating and coding on laptops in Gondar university learning lounge"
                  fill
                  sizes="(max-width: 991px) 100vw, 560px"
                  style={{ objectFit: 'cover' }}
                />
              </div>

              {/* Floating Highlight Card */}
              <div
                className="position-absolute bottom-0 start-0 m-3 p-3 rounded-3 bg-white shadow-md border border-light-subtle d-none d-sm-block"
                style={{ maxWidth: '320px', zIndex: 2 }}
              >
                <div className="d-flex align-items-center gap-2 mb-1">
                  <Sparkles size={16} className="text-primary" />
                  <strong className="small text-dark">{t.mission.apprenticeshipTitle}</strong>
                </div>
                <p className="small text-muted mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                  {t.mission.apprenticeshipDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
