'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, Globe, ChevronDown, Heart, Smartphone } from 'lucide-react';
import { MAIN_NAVIGATION } from '@/lib/constants/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LOCALE_LABELS } from '@/lib/i18n/config';
import { MobileNavigation } from './MobileNavigation';
import { GetAppModal } from '@/components/ui/GetAppModal';

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [getAppOpen, setGetAppOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const pathname = usePathname();
  const { locale, toggleLocale, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <Link href="/" className="brand-link" aria-label="Erkab Skills Training Organization Home">
            <div className="brand-mark">
              <Image
                src="/images/logo/erkab-logo-square.jpg"
                alt="Erkab Skills Training Organization Official Logo"
                width={44}
                height={44}
                className="brand-mark-img"
                priority
              />
            </div>
            <div className="brand-text">
              <span className="brand-name">{t.brand.name}</span>
              <span className="brand-tagline">{t.brand.subName}</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="d-none d-lg-block" aria-label="Main Navigation">
            <ul className="nav-menu-desktop">
              {MAIN_NAVIGATION.map((item) => {
                const navLabel = (t.nav as Record<string, string>)[item.key] || item.label;
                if (item.children) {
                  return (
                    <li
                      key={item.key}
                      ref={dropdownRef}
                      className="position-relative"
                    >
                      <button
                        className="nav-link-item bg-transparent border-0 d-inline-flex align-items-center gap-1"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        aria-expanded={dropdownOpen}
                      >
                        <span>{navLabel}</span>
                        <ChevronDown size={15} />
                      </button>

                      {dropdownOpen && (
                        <ul
                          className="position-absolute bg-white rounded-3 shadow-lg p-2 list-unstyled mt-2 border border-light-subtle"
                          style={{
                            minWidth: '200px',
                            zIndex: 1050,
                            top: '100%',
                            left: 0,
                          }}
                        >
                          {item.children.map((sub) => {
                            const subLabel = (t.nav as Record<string, string>)[sub.key] || sub.label;
                            return (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  className={`dropdown-item px-3 py-2 rounded-2 ${
                                    pathname === sub.href
                                      ? 'fw-bold text-primary bg-light'
                                      : 'text-dark'
                                  }`}
                                  onClick={() => setDropdownOpen(false)}
                                >
                                  {subLabel}
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
                      className={`nav-link-item ${isActive ? 'active' : ''}`}
                    >
                      {navLabel}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Actions & Language Switch */}
          <div className="header-actions">
            <button
              onClick={toggleLocale}
              className="lang-switch-btn d-none d-sm-inline-flex"
              title="Change Language / ቋንቋ ይቀይሩ"
              aria-label="Toggle language between English and Amharic"
            >
              <Globe size={15} />
              <span className="fw-semibold">{locale === 'en' ? 'አማርኛ' : 'English'}</span>
            </button>

            {/* Get App Button - Desktop & Tablet */}
            <button
              type="button"
              className="btn-erkab btn-erkab-app d-none d-sm-inline-flex"
              onClick={() => setGetAppOpen(true)}
              aria-label={t.getAppModal.title}
              title={t.nav.getApp}
            >
              <Smartphone size={15} className="btn-erkab-app-icon text-primary" />
              <span>{t.nav.getApp}</span>
            </button>

            {/* Get App Button - Mobile Top Bar (Compact Icon Button with >= 44x44 touch target) */}
            <button
              type="button"
              className="get-app-compact-btn d-inline-flex d-sm-none"
              onClick={() => setGetAppOpen(true)}
              aria-label={t.getAppModal.title}
              title={t.nav.getApp}
            >
              <Smartphone size={18} />
              <span className="get-app-compact-dot" aria-hidden="true" />
            </button>

            <Link
              href="/donations"
              className="btn-erkab btn-erkab-donate d-none d-xl-inline-flex"
            >
              <Heart size={15} />
              <span>{t.nav.donateNow}</span>
            </Link>

            <Link
              href="/apply"
              className="btn-erkab btn-erkab-lime d-none d-sm-inline-flex"
            >
              {t.nav.applyNow}
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              className="nav-toggle-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu size={26} />
            </button>
          </div>
        </div>
      </header>

      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenGetApp={() => setGetAppOpen(true)}
      />

      <GetAppModal
        isOpen={getAppOpen}
        onClose={() => setGetAppOpen(false)}
      />
    </>
  );
}
