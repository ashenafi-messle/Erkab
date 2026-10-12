'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Award, Laptop, MapPin, Heart } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="hero-wrapper">
      <div className="hero-banner">
        {/* Glow & Atmospheric Accents */}
        <div className="hero-glow-element" />
        <div className="hero-lime-accent" />

        <div className="row align-items-center g-5 position-relative" style={{ zIndex: 2 }}>
          {/* Main Hero Copy */}
          <div className="col-lg-6">
            {/* Highlight Badge */}
            <div className="d-inline-flex align-items-center gap-2 mb-2">
              <span className="erkab-badge badge-lime-on-dark">
                <Sparkles size={14} />
                <span>{t.hero.highlight}</span>
              </span>
            </div>

            <h1 className="hero-title">{t.hero.headline}</h1>

            <p className="hero-desc">{t.hero.supportText}</p>

            <div className="hero-actions">
              <Link href="/apply" className="btn-erkab btn-erkab-lime">
                <span>{t.hero.applyAction}</span>
                <ArrowRight size={17} />
              </Link>
              <Link href="/programs" className="btn-erkab btn-erkab-outline-white">
                <span>{t.hero.exploreAction}</span>
              </Link>
            </div>

            {/* Supporting Donation Action */}
            <div className="d-flex align-items-center flex-wrap gap-2 mt-3 pt-1">
              <span className="small text-white-50">{t.hero.sponsorPrompt}</span>
              <Link
                href="/donations"
                className="small text-decoration-none fw-bold text-white d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill"
                style={{ background: 'rgba(255, 255, 255, 0.16)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.25)' }}
              >
                <Heart size={13} className="text-danger" />
                <span>{t.hero.donateLink}</span>
              </Link>
            </div>

            <div className="mt-4 pt-3 border-top border-white-50 d-flex flex-wrap gap-4 small text-white-50">
              <div className="d-flex align-items-center gap-2">
                <MapPin size={16} className="text-warning" />
                <span>{t.hero.location}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Award size={16} className="text-warning" />
                <span>{t.hero.cohortStatus}</span>
              </div>
            </div>
          </div>

          {/* Cinematic Hero Photography Container */}
          <div className="col-lg-6">
            <div className="hero-image-container">
              {/* Desktop & Mobile Responsive Next.js Image */}
              <Image
                src="/images/hero/erkab-hero-desktop.jpg"
                alt="Ethiopian students learning full-stack development and AI on laptops in modern Gondar computer lab with cyan holographic overlays"
                fill
                priority
                sizes="(max-width: 991px) 100vw, 580px"
                className="hero-main-photo"
              />

              {/* Floating Top Badge */}
              <div className="hero-floating-top d-flex align-items-center gap-2">
                <Image
                  src="/images/logo/erkab-logo-square.jpg"
                  alt="Erkab Logo"
                  width={22}
                  height={22}
                  className="rounded-circle border border-light flex-shrink-0"
                />
                <span className="pulse-indicator" />
                <span>{t.hero.labBadge}</span>
              </div>

              {/* Floating Bottom Card */}
              <div className="hero-floating-badge">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                      style={{ background: 'rgba(19, 188, 235, 0.25)', color: '#13BCEB' }}
                    >
                      <Laptop size={18} />
                    </div>
                    <div>
                      <div className="fw-bold text-white small">{t.hero.projectDefense}</div>
                      <small className="text-white-50" style={{ fontSize: '0.75rem' }}>
                        {t.common.allTracksCount}
                      </small>
                    </div>
                  </div>
                  <span className="badge badge-lime d-none d-sm-inline-block small">{t.common.scholarshipTrack}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
