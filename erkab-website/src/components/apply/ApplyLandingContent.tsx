'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { GraduationCap, Award, ArrowRight } from 'lucide-react';

export function ApplyLandingContent() {
  const { locale, t } = useLanguage();
  const isAm = locale === 'am';

  return (
    <>
      <PageHero
        badge={t.applyPage.heroBadge}
        title={t.applyPage.heroTitle}
        description={t.applyPage.heroDesc}
      />

      <section className="section-py section-bg-white pt-0">
        <Container>
          <div className="row g-4 justify-content-center">
            {/* Student Card */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="p-4 p-md-5 rounded-4 bg-light border border-light-subtle shadow-sm h-100 d-flex flex-column text-start">
                <div
                  className="rounded-3 p-3 d-inline-flex align-items-center justify-content-center text-primary mb-3"
                  style={{ background: 'rgba(8, 120, 185, 0.1)', width: '60px', height: '60px' }}
                >
                  <GraduationCap size={32} />
                </div>
                <span className="badge badge-lime align-self-start mb-2">{t.common.scholarshipTrack}</span>
                <h2 className="h4 fw-bold text-dark mb-2">{t.applyPage.studentCardTitle}</h2>
                <p className="text-muted small mb-4 flex-grow-1" style={{ lineHeight: '1.6' }}>
                  {t.applyPage.studentCardDesc}
                </p>
                <Link href="/apply/student" className="btn-erkab btn-erkab-lime justify-content-center">
                  <span>{t.applyPage.studentCardBtn}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Trainer Card */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="p-4 p-md-5 rounded-4 bg-light border border-light-subtle shadow-sm h-100 d-flex flex-column text-start">
                <div
                  className="rounded-3 p-3 d-inline-flex align-items-center justify-content-center text-primary mb-3"
                  style={{ background: 'rgba(19, 188, 235, 0.15)', width: '60px', height: '60px' }}
                >
                  <Award size={32} />
                </div>
                <span className="badge badge-cyan align-self-start mb-2">
                  {isAm ? 'አሰልጣኝ እና መካሪ' : 'Trainer & Mentor'}
                </span>
                <h2 className="h4 fw-bold text-dark mb-2">{t.applyPage.trainerCardTitle}</h2>
                <p className="text-muted small mb-4 flex-grow-1" style={{ lineHeight: '1.6' }}>
                  {t.applyPage.trainerCardDesc}
                </p>
                <Link href="/apply/trainer" className="btn-erkab btn-erkab-primary justify-content-center">
                  <span>{t.applyPage.trainerCardBtn}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Tutor Card */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="p-4 p-md-5 rounded-4 bg-light border border-light-subtle shadow-sm h-100 d-flex flex-column text-start">
                <div
                  className="rounded-3 p-3 d-inline-flex align-items-center justify-content-center text-primary mb-3"
                  style={{ background: 'rgba(199, 255, 69, 0.25)', width: '60px', height: '60px' }}
                >
                  <Award size={32} />
                </div>
                <span className="badge badge-lime align-self-start mb-2">
                  {isAm ? 'አካዳሚክ ሞግዚት' : 'Academic Tutor'}
                </span>
                <h2 className="h4 fw-bold text-dark mb-2">
                  {isAm ? 'የአካዳሚክ ሞግዚትነት ማመልከቻ' : 'Academic Tutor Network'}
                </h2>
                <p className="text-muted small mb-4 flex-grow-1" style={{ lineHeight: '1.6' }}>
                  {isAm
                    ? 'በጎንደር ወይም በኦንላይን ተማሪዎችን ለማስተማር እና ለማብቃት የእርካብ የሞግዚቶች መረብን ይቀላቀሉ።'
                    : 'Join our vetted network of tutors to deliver personalized academic instruction in Gondar or online.'}
                </p>
                <Link href="/apply/tutor" className="btn-erkab btn-erkab-primary justify-content-center">
                  <span>{isAm ? 'በሞግዚትነት ያመልክቱ' : 'Apply as a Tutor'}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
