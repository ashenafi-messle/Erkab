'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X, Globe, ArrowRight, ChevronDown, Heart, Smartphone } from 'lucide-react';
import { MAIN_NAVIGATION } from '@/lib/constants/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LOCALE_LABELS } from '@/lib/i18n/config';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGetApp: () => void;
}

export function MobileNavigation({ isOpen, onClose, onOpenGetApp }: MobileNavigationProps) {
  const pathname = usePathname();
  const { locale, toggleLocale, t } = useLanguage();
  const [moreExpanded, setMoreExpanded] = React.useState(false);

  return (
    <>
      <div
        className={`mobile-nav-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`mobile-nav-drawer ${isOpen ? 'open' : ''}`}
        aria-label="Mobile Navigation"
      >
        <div className="mobile-nav-header">
          <div className="d-flex align-items-center gap-2">
            <div className="brand-mark">
              <Image
                src="/images/logo/erkab-logo-square.jpg"
                alt="Erkab Official Logo"
                width={40}
                height={40}
                className="brand-mark-img"
              />
            </div>
            <div>
              <div className="fw-bold" style={{ color: 'var(--color-primary-dark)' }}>
                {t.brand.name}
              </div>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                {t.brand.subName}
              </small>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-light rounded-circle p-2"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Prominent Quick Actions Near Top of Drawer */}
        <div className="p-3 bg-light rounded-3 mb-3 d-flex flex-column gap-2 border border-light-subtle">
          <Link
            href="/apply"
            className="btn-erkab btn-erkab-lime w-100 justify-content-center"
            onClick={onClose}
          >
            <span>{t.nav.applyNow}</span>
            <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            className="btn-erkab btn-erkab-app w-100 justify-content-center"
            onClick={() => {
              onClose();
              onOpenGetApp();
            }}
            aria-label={t.getAppModal.title}
          >
            <Smartphone size={16} className="text-primary flex-shrink-0" />
            <span>{t.nav.getApp}</span>
            <span
              className="badge bg-primary text-white rounded-pill ms-auto px-2 py-1"
              style={{ fontSize: '0.68rem', fontWeight: 600 }}
            >
              {t.getAppModal.badge}
            </span>
          </button>
          <Link
            href="/donations"
            className="btn-erkab btn-erkab-donate w-100 justify-content-center"
            onClick={onClose}
          >
            <Heart size={16} className="text-primary" />
            <span>{t.nav.donateNow}</span>
          </Link>
        </div>

        <nav className="flex-grow-1">
          <ul className="mobile-nav-list">
            {MAIN_NAVIGATION.map((item) => {
              const navLabel = (t.nav as Record<string, string>)[item.key] || item.label;
              if (item.children) {
                return (
                  <li key={item.key}>
                    <button
                      className="mobile-nav-link w-100 border-0 bg-transparent text-start"
                      onClick={() => setMoreExpanded(!moreExpanded)}
                    >
                      <span>{navLabel}</span>
                      <ChevronDown
                        size={18}
                        style={{
                          transform: moreExpanded ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}
                      />
                    </button>
                    {moreExpanded && (
                      <ul className="list-unstyled ps-3 mt-1 d-flex flex-column gap-2">
                        {item.children.map((sub) => {
                          const subLabel = (t.nav as Record<string, string>)[sub.key] || sub.label;
                          return (
                            <li key={sub.href}>
                              <Link
                                href={sub.href}
                                className={`mobile-nav-link ${pathname === sub.href ? 'active' : ''}`}
                                onClick={onClose}
                              >
                                <span>{subLabel}</span>
                                <ArrowRight size={14} className="text-muted" />
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <span>{navLabel}</span>
                    <ArrowRight size={16} className="text-muted" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="pt-3 border-top mt-4 d-flex flex-column gap-3">
          <button
            onClick={toggleLocale}
            className="lang-switch-btn w-100 justify-content-center"
            aria-label="Switch Language / ቋንቋ ይቀይሩ"
          >
            <Globe size={16} />
            <span className="fw-semibold">
              {locale === 'en' ? 'ቋንቋ ይቀይሩ (ወደ አማርኛ)' : 'Switch Language (to English)'}
            </span>
          </button>

          <Link
            href="/apply"
            className="btn-erkab btn-erkab-lime w-100 justify-content-center"
            onClick={onClose}
          >
            {t.nav.applyNow}
          </Link>
        </div>
      </aside>
    </>
  );
}
