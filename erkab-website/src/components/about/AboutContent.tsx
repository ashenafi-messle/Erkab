'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import { CertificateSection } from '@/components/about/CertificateSection';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CheckCircle2, Target, Eye, ShieldCheck, ArrowRight } from 'lucide-react';

export function AboutContent() {
  const { t } = useLanguage();

  return (
    <>
      <PageHero
        badge={t.aboutPage.heroBadge}
        title={t.aboutPage.heroTitle}
        description={t.aboutPage.heroDesc}
      />

      <section className="section-py section-bg-white pt-0">
        <Container>
          {/* Authentic Campus Learning Photography */}
          <div
            className="position-relative w-100 rounded-4 overflow-hidden mb-5 shadow-sm border border-light-subtle"
            style={{ aspectRatio: '16 / 8', maxHeight: '420px', backgroundColor: '#071927' }}
          >
            <Image
              src="/images/organization/students-learning.jpg"
              alt="Students learning and coding collaboratively in modern Gondar educational center"
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              style={{ objectFit: 'cover' }}
            />
          </div>

          <div className="row g-5 align-items-center mb-5">
            <div className="col-lg-6">
              <span className="erkab-badge badge-blue mb-3">{t.aboutPage.purposeTag}</span>
              <h2 className="h2 fw-bold text-dark mb-4">
                {t.aboutPage.purposeHeading}
              </h2>
              <p className="text-muted lead fs-6 mb-3" style={{ lineHeight: '1.7' }}>
                {t.aboutPage.purposeP1}
              </p>
              <p className="text-muted mb-4" style={{ lineHeight: '1.7' }}>
                {t.aboutPage.purposeP2}
              </p>
              <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light border border-light-subtle">
                <div className="brand-mark bg-white" style={{ width: '48px', height: '48px' }}>
                  <Image
                    src="/images/logo/erkab-logo-square.jpg"
                    alt="Erkab Official Logo"
                    width={48}
                    height={48}
                    className="brand-mark-img"
                  />
                </div>
                <div>
                  <span className="small text-muted d-block">{t.aboutPage.hqCampusLabel}</span>
                  <strong className="text-dark">{t.footer.location}</strong>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="row g-4">
                <div className="col-12">
                  <div className="p-4 rounded-4 bg-light border border-light-subtle shadow-sm">
                    <div className="d-flex align-items-center gap-2 text-primary fw-bold mb-2">
                      <Target size={20} />
                      <span>{t.aboutPage.missionTitle}</span>
                    </div>
                    <p className="text-muted small mb-0" style={{ lineHeight: '1.6' }}>
                      {t.aboutPage.missionDesc}
                    </p>
                  </div>
                </div>

                <div className="col-12">
                  <div className="p-4 rounded-4 bg-light border border-light-subtle shadow-sm">
                    <div className="d-flex align-items-center gap-2 text-primary fw-bold mb-2">
                      <Eye size={20} />
                      <span>{t.aboutPage.visionTitle}</span>
                    </div>
                    <p className="text-muted small mb-0" style={{ lineHeight: '1.6' }}>
                      {t.aboutPage.visionDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Guiding Principles */}
          <div className="my-5 p-4 p-md-5 rounded-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <h3 className="h4 fw-bold text-dark text-center mb-4">{t.aboutPage.valuesHeading}</h3>
            <div className="row g-4">
              <div className="col-12 col-md-4">
                <div className="h-100 p-3 bg-white rounded-3 shadow-sm border border-light-subtle">
                  <div className="fw-bold text-primary mb-2 d-flex align-items-center gap-2">
                    <ShieldCheck size={18} />
                    <span>{t.aboutPage.val1Title}</span>
                  </div>
                  <p className="text-muted small mb-0">
                    {t.aboutPage.val1Desc}
                  </p>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="h-100 p-3 bg-white rounded-3 shadow-sm border border-light-subtle">
                  <div className="fw-bold text-primary mb-2 d-flex align-items-center gap-2">
                    <CheckCircle2 size={18} />
                    <span>{t.aboutPage.val2Title}</span>
                  </div>
                  <p className="text-muted small mb-0">
                    {t.aboutPage.val2Desc}
                  </p>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="h-100 p-3 bg-white rounded-3 shadow-sm border border-light-subtle">
                  <div className="fw-bold text-primary mb-2 d-flex align-items-center gap-2">
                    <CheckCircle2 size={18} />
                    <span>{t.aboutPage.val3Title}</span>
                  </div>
                  <p className="text-muted small mb-0">
                    {t.aboutPage.val3Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Official Recognition & Organizational Identity Section */}
      <CertificateSection />

      {/* Join Community CTA */}
      <section className="section-py section-bg-white">
        <Container>
          <div className="text-center">
            <h3 className="h4 fw-bold text-dark mb-3">{t.aboutPage.communityHeading}</h3>
            <p className="text-muted mx-auto mb-4" style={{ maxWidth: '520px' }}>
              {t.aboutPage.communityDesc}
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link href="/apply" className="btn-erkab btn-erkab-lime">
                <span>{t.aboutPage.applyScholarships}</span>
                <ArrowRight size={16} />
              </Link>
              <Link href="/donations" className="btn-erkab btn-erkab-donate">
                <span>{t.common.supportMission}</span>
              </Link>
              <Link href="/partnerships" className="btn-erkab btn-erkab-primary">
                <span>{t.common.partnerWithUs}</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
