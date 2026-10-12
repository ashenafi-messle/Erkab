'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import { Announcement, getLocalizedAnnouncement } from '@/features/announcements/service';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Calendar, ArrowRight } from 'lucide-react';

interface NewsContentProps {
  initialAnnouncements: Announcement[];
}

export function NewsContent({ initialAnnouncements }: NewsContentProps) {
  const { locale, t } = useLanguage();
  const announcements = initialAnnouncements.map((a) => getLocalizedAnnouncement(a, locale));

  return (
    <>
      <PageHero
        badge={t.newsPage.heroBadge}
        title={t.newsPage.heroTitle}
        description={t.newsPage.heroDesc}
      />

      <section className="section-py section-bg-white pt-0">
        <Container>
          {announcements.length === 0 ? (
            <div className="text-center py-5 text-muted">
              {t.newsPage.emptyNotice}
            </div>
          ) : (
            <div className="row g-4">
              {announcements.map((item) => (
                <div key={item.id} className="col-12 col-md-6">
                  <div className="p-4 bg-white rounded-4 border border-light-subtle shadow-sm h-100 d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="badge badge-blue small">
                        {locale === 'am' ? 'ቅበላ እና ምዝገባ' : item.category}
                      </span>
                      <div className="d-flex align-items-center gap-1 text-muted small">
                        <Calendar size={14} />
                        <span>{item.date}</span>
                      </div>
                    </div>
                    <h2 className="h5 fw-bold text-dark mb-2">{item.title}</h2>
                    <p className="text-muted small mb-4 flex-grow-1" style={{ lineHeight: '1.6' }}>
                      {item.summary}
                    </p>
                    <Link
                      href={`/news/${item.slug}`}
                      className="text-primary fw-bold small text-decoration-none d-inline-flex align-items-center gap-1"
                    >
                      <span>{t.newsPage.readFull}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
