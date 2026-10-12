'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '../layout/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ArrowRight, AlertCircle } from 'lucide-react';

export function HowItWorks() {
  const { t } = useLanguage();

  const STEPS = [
    { num: 1, title: t.howItWorks.step1Title, desc: t.howItWorks.step1Desc },
    { num: 2, title: t.howItWorks.step2Title, desc: t.howItWorks.step2Desc },
    { num: 3, title: t.howItWorks.step3Title, desc: t.howItWorks.step3Desc },
    { num: 4, title: t.howItWorks.step4Title, desc: t.howItWorks.step4Desc },
  ];

  return (
    <section className="section-py section-bg-white" id="how-it-works">
      <Container>
        <SectionHeading
          tag={t.howItWorks.tag}
          title={t.howItWorks.heading}
          subtitle={t.howItWorks.subheading}
        />

        <div className="row g-4 mb-4">
          {STEPS.map((step) => (
            <div key={step.num} className="col-12 col-md-6 col-lg-3">
              <div className="step-card">
                <div className="step-number">{step.num}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Clear Disclaimer Panel */}
        <div className="p-3 p-md-4 rounded-3 bg-light border border-secondary-subtle d-flex align-items-start gap-3 mt-4">
          <AlertCircle size={22} className="text-primary flex-shrink-0 mt-1" />
          <div className="small text-muted">
            <strong className="text-dark d-block mb-1">{t.howItWorks.disclaimerHeading}</strong>
            {t.howItWorks.disclaimer}
          </div>
        </div>

        <div className="text-center mt-4">
          <Link href="/apply" className="btn-erkab btn-erkab-lime">
            <span>{t.nav.applyNow}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
