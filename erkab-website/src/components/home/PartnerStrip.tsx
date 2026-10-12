'use client';

import React from 'react';
import Image from 'next/image';
import { Container } from '../layout/Container';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ShieldCheck, Sparkles, GraduationCap, Globe } from 'lucide-react';

export function PartnerStrip() {
  const { t } = useLanguage();

  return (
    <section className="partner-strip">
      <Container>
        <div className="strip-content">
          <div className="d-flex align-items-center gap-2">
            <Image
              src="/images/logo/erkab-logo-square.jpg"
              alt="Erkab Official Logo"
              width={30}
              height={30}
              className="rounded-circle border border-primary-subtle shadow-sm flex-shrink-0"
            />
            <span className="strip-text mb-0">{t.strip.message}</span>
          </div>
          <div className="d-flex flex-wrap align-items-center justify-content-center gap-3">
            <span className="strip-pill">
              <GraduationCap size={16} className="text-primary" />
              <span>{t.strip.vocationalExcellence}</span>
            </span>
            <span className="text-black-50 d-none d-sm-inline">•</span>
            <span className="strip-pill">
              <Globe size={16} className="text-primary" />
              <span>{t.strip.globalStandards}</span>
            </span>
            <span className="text-black-50 d-none d-sm-inline">•</span>
            <span className="strip-pill">
              <Sparkles size={16} className="text-primary" />
              <span>{t.strip.localImpact}</span>
            </span>
            <span className="text-black-50 d-none d-sm-inline">•</span>
            <span className="strip-pill">
              <ShieldCheck size={16} className="text-primary" />
              <span>{t.strip.location}</span>
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
