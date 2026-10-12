'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import { Announcement, getLocalizedAnnouncement } from '@/features/announcements/service';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';

interface NewsDetailContentProps {
  initialAnnouncement: Announcement;
}

export function NewsDetailContent({ initialAnnouncement }: NewsDetailContentProps) {
  const { locale, t } = useLanguage();
  const isAm = locale === 'am';
  const announcement = getLocalizedAnnouncement(initialAnnouncement, locale);

  return (
    <>
      <PageHero
        badge={isAm ? 'ቅበላ እና ምዝገባ' : announcement.category}
        title={announcement.title}
        description={announcement.summary}
      />

      <section className="section-py section-bg-white pt-0">
        <Container>
          <div className="mx-auto" style={{ maxWidth: '820px' }}>
            <div className="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom text-muted small">
              <div className="d-flex align-items-center gap-3">
                <span className="badge bg-light text-muted border d-inline-flex align-items-center gap-1">
                  <Tag size={12} />
                  <span>{announcement.category}</span>
                </span>
                <div className="d-flex align-items-center gap-1">
                  <Calendar size={14} />
                  <span>{announcement.date}</span>
                </div>
              </div>
              <Link href="/news" className="text-primary text-decoration-none d-inline-flex align-items-center gap-1">
                <ArrowLeft size={16} />
                <span>{t.newsPage.backToNews}</span>
              </Link>
            </div>

            {announcement.coverImageUrl && (
              <div
                className="position-relative w-100 rounded-4 overflow-hidden mb-4 shadow-sm border border-light-subtle"
                style={{ aspectRatio: '16 / 9', maxHeight: '420px', backgroundColor: '#071927' }}
              >
                <Image
                  src={announcement.coverImageUrl}
                  alt={announcement.title}
                  fill
                  priority
                  sizes="(max-width: 1200px) 100vw, 820px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}

            <div className="fs-6 text-dark mb-4" style={{ lineHeight: '1.8', whiteSpace: 'pre-line' }}>
              {announcement.content}
            </div>

            <div className="p-4 rounded-4 bg-light border border-light-subtle my-5 text-start">
              <h3 className="h6 fw-bold text-dark mb-2">
                {isAm ? 'በዚህ የስልጠና ዙር መሳተፍ ይፈልጋሉ?' : 'Interested in participating in this cohort?'}
              </h3>
              <p className="small text-muted mb-3">
                {isAm
                  ? 'የአመልካቾች ቅበላ በተከታታይ ግምገማ የሚከናወን ነው። አስቀድመው መመዘኛዎችን እንዲገመግሙ እና ሰነዶችን እንዲያዘጋጁ እንመክራለን።'
                  : 'Admissions are processed on a rolling review model. We recommend reviewing eligibility and preparing your verification documents early.'}
              </p>
              <Link href="/apply/student" className="btn-erkab btn-erkab-lime">
                <span>{isAm ? 'የተማሪ ማመልከቻ ይጀምሩ' : 'Start Student Application'}</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
