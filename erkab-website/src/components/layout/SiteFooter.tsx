'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from './Container';
import { FOOTER_PROGRAMS, FOOTER_ORGANIZATION, FOOTER_LEGAL } from '@/lib/constants/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { MapPin, Mail, ArrowUpRight } from 'lucide-react';

export function SiteFooter() {
  const { locale, t } = useLanguage();
  const currentYear = 2026;

  return (
    <footer className="site-footer">
      <Container>
        <div className="row g-4 justify-content-between">
          {/* Brand info */}
          <div className="col-lg-4 col-md-6">
            <div className="footer-brand">
              <div className="d-flex align-items-center gap-2 mb-2">
                <div className="brand-mark bg-white">
                  <Image
                    src="/images/logo/erkab-logo-square.jpg"
                    alt="Erkab Skills Training Organization Official Logo"
                    width={44}
                    height={44}
                    className="brand-mark-img"
                  />
                </div>
                <div className="footer-brand-title">{t.brand.name}</div>
              </div>
              <p className="small text-white-50 mb-3" style={{ lineHeight: '1.6' }}>
                {t.footer.desc}
              </p>
              <div className="d-flex flex-column gap-2 small">
                <div className="d-flex align-items-center gap-2 text-white-50">
                  <MapPin size={16} className="text-info flex-shrink-0" />
                  <span>{t.footer.location}</span>
                </div>
                <div className="d-flex align-items-center gap-2 text-white-50">
                  <Mail size={16} className="text-info flex-shrink-0" />
                  <a href={`mailto:${t.footer.emails}`} className="text-white-50 text-decoration-none footer-link-email">
                    {t.footer.emails}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Programs */}
          <div className="col-lg-3 col-md-6 col-sm-6">
            <h3 className="footer-heading">{t.footer.programsHeading}</h3>
            <ul className="footer-links">
              {FOOTER_PROGRAMS.map((prog) => (
                <li key={prog.href}>
                  <Link href={prog.href} className="footer-link d-inline-flex align-items-center gap-1">
                    <span>{locale === 'am' ? prog.labelAm : prog.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Organization */}
          <div className="col-lg-2 col-md-6 col-sm-6">
            <h3 className="footer-heading">{t.footer.orgHeading}</h3>
            <ul className="footer-links">
              {FOOTER_ORGANIZATION.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="footer-link">
                    {locale === 'am' ? item.labelAm : item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Action */}
          <div className="col-lg-3 col-md-6">
            <h3 className="footer-heading">{t.footer.legalHeading}</h3>
            <ul className="footer-links mb-4">
              {FOOTER_LEGAL.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="footer-link">
                    {locale === 'am' ? item.labelAm : item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="small d-block text-white mb-2 fw-bold">{t.footer.readyTitle}</span>
              <Link href="/apply" className="btn-erkab btn-erkab-lime w-100 justify-content-center text-decoration-none">
                <span>{t.nav.applyNow}</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="text-white-50 small">
            © {currentYear} {t.footer.rights}
          </div>
          <div className="text-white-50 small">
            {t.brand.slogan} • {t.brand.supportMessage}
          </div>
        </div>

        {/* Developer Credits Section */}
        <div className="footer-credits">
          <div className="footer-credits-primary">
            Developed By Ardab Tech Solutions S.C
          </div>
          <div className="footer-credits-contributors">
            <span className="footer-credits-item">Ambelu Endalew ( Phd Researcher )</span>
            <span className="footer-credits-separator" aria-hidden="true">•</span>
            <span className="footer-credits-item">Ashenafi Messle ( Software Engineer )</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
