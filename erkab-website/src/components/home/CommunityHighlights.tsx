'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '../layout/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { BookOpen, Handshake, Heart, ArrowRight } from 'lucide-react';

export function CommunityHighlights() {
  const { t } = useLanguage();

  return (
    <section className="section-py section-bg-light" id="community-outreach">
      <Container>
        <SectionHeading
          tag={t.communityHighlights.tag}
          title={t.communityHighlights.title}
          subtitle={t.communityHighlights.subtitle}
          tagColor="blue"
        />

        <div className="row g-4">
          {/* Card 1: Tutoring Services */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="feature-card d-flex flex-column h-100 p-0 overflow-hidden shadow-sm">
              <div
                className="position-relative w-100"
                style={{ aspectRatio: '16 / 9', backgroundColor: '#071927' }}
              >
                <Image
                  src="/images/tutoring/in-person-tutoring.jpg"
                  alt="In-person and online tutoring in Gondar"
                  fill
                  sizes="(max-width: 768px) 100vw, 380px"
                  style={{ objectFit: 'cover' }}
                />
                <span className="badge bg-dark bg-opacity-75 text-white position-absolute top-0 start-0 m-2 small">
                  {t.communityHighlights.tutoringBadge}
                </span>
              </div>

              <div className="p-4 d-flex flex-column flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div className="p-2 rounded-3 bg-light text-primary">
                    <BookOpen size={18} />
                  </div>
                  <h3 className="h6 fw-bold mb-0 text-dark">{t.communityHighlights.tutoringTitle}</h3>
                </div>
                <p className="text-muted small mb-4 flex-grow-1" style={{ lineHeight: '1.55' }}>
                  {t.communityHighlights.tutoringDesc}
                </p>
                <Link
                  href="/tutoring"
                  className="btn-erkab btn-erkab-primary w-100 justify-content-center mt-auto"
                >
                  <span>{t.communityHighlights.tutoringBtn}</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Strategic Partnerships */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="feature-card d-flex flex-column h-100 p-0 overflow-hidden shadow-sm">
              <div
                className="position-relative w-100"
                style={{ aspectRatio: '16 / 9', backgroundColor: '#071927' }}
              >
                <Image
                  src="/images/partnerships/collaboration.jpg"
                  alt="Partnership collaboration and workshop in Gondar"
                  fill
                  sizes="(max-width: 768px) 100vw, 380px"
                  style={{ objectFit: 'cover' }}
                />
                <span className="badge bg-dark bg-opacity-75 text-white position-absolute top-0 start-0 m-2 small">
                  {t.communityHighlights.partnerBadge}
                </span>
              </div>

              <div className="p-4 d-flex flex-column flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div className="p-2 rounded-3 bg-light text-primary">
                    <Handshake size={18} />
                  </div>
                  <h3 className="h6 fw-bold mb-0 text-dark">{t.communityHighlights.partnerTitle}</h3>
                </div>
                <p className="text-muted small mb-4 flex-grow-1" style={{ lineHeight: '1.55' }}>
                  {t.communityHighlights.partnerDesc}
                </p>
                <Link
                  href="/partnerships"
                  className="btn-erkab btn-erkab-outline-blue w-100 justify-content-center mt-auto"
                >
                  <span>{t.communityHighlights.partnerBtn}</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: Philanthropy & Donations */}
          <div className="col-12 col-md-12 col-lg-4">
            <div
              className="feature-card d-flex flex-column h-100 p-4 border-0 text-white position-relative overflow-hidden shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #075A91 0%, #0878B9 100%)',
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div
                  className="p-2 rounded-3 d-inline-flex"
                  style={{ background: 'rgba(255, 255, 255, 0.18)' }}
                >
                  <Heart size={20} className="text-white" />
                </div>
                <span className="badge badge-lime small">{t.communityHighlights.donationBadge}</span>
              </div>

              <h3 className="h6 fw-bold text-white mb-2">{t.communityHighlights.donationTitle}</h3>
              <p className="text-white-50 small mb-4 flex-grow-1" style={{ lineHeight: '1.6' }}>
                {t.communityHighlights.donationDesc}
              </p>

              <div className="p-3 rounded-3 mb-4" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                <span className="small text-white d-block fw-bold mb-1">{t.communityHighlights.donationGoalTitle}</span>
                <span className="small text-white-50 d-block" style={{ fontSize: '0.8rem' }}>
                  {t.communityHighlights.donationGoalDesc}
                </span>
              </div>

              <Link
                href="/donations"
                className="btn-erkab btn-erkab-lime w-100 justify-content-center mt-auto"
              >
                <span>{t.communityHighlights.donationBtn}</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
