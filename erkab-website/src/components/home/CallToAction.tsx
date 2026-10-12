'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '../layout/Container';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Handshake, Heart } from 'lucide-react';

export function CallToAction() {
  const { t } = useLanguage();

  return (
    <section className="section-py section-bg-white">
      <Container>
        <div
          className="p-4 p-md-5 rounded-4 text-white position-relative overflow-hidden"
          style={{
            background: 'var(--gradient-hero)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div className="row align-items-center g-4 position-relative" style={{ zIndex: 2 }}>
            <div className="col-lg-8">
              <span className="erkab-badge badge-lime-on-dark mb-2">
                {t.partnerships.tag}
              </span>
              <h2 className="display-6 fw-bold text-white mb-3">
                {t.partnerships.heading}
              </h2>
              <p className="text-white-50 lead fs-6 mb-0" style={{ maxWidth: '650px' }}>
                {t.partnerships.subheading}
              </p>
            </div>

            <div className="col-lg-4 d-flex flex-column gap-3 justify-content-center">
              <Link href="/partnerships" className="btn-erkab btn-erkab-lime justify-content-center">
                <Handshake size={18} />
                <span>{t.partnerships.partnerCta}</span>
              </Link>

              <Link href="/donations" className="btn-erkab btn-erkab-outline-white justify-content-center">
                <Heart size={18} />
                <span>{t.partnerships.donateCta}</span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
