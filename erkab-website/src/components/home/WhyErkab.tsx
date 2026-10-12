'use client';

import React from 'react';
import { Container } from '../layout/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Code, Award, Briefcase, MonitorCheck } from 'lucide-react';

export function WhyErkab() {
  const { t } = useLanguage();

  const ICONS = [
    <Code key="1" size={24} />,
    <Award key="2" size={24} />,
    <Briefcase key="3" size={24} />,
    <MonitorCheck key="4" size={24} />,
  ];

  return (
    <section className="section-py section-bg-white">
      <Container>
        <SectionHeading
          tag={t.whyErkab.tag}
          title={t.whyErkab.heading}
          subtitle={t.whyErkab.subheading}
          tagColor="lime"
        />

        <div className="row g-4">
          {t.whyErkab.cards.map((card, idx) => (
            <div key={idx} className="col-12 col-md-6 col-lg-3">
              <div className="feature-card">
                <div className="feature-icon-box">{ICONS[idx]}</div>
                <h3 className="feature-title">{card.title}</h3>
                <p className="feature-desc">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
