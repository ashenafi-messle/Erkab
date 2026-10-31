'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '../layout/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { EmptyState } from '../ui/EmptyState';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getAnnouncements, Announcement } from '@/features/announcements/service';
import { Bell, Calendar, ArrowRight } from 'lucide-react';

export function AnnouncementPreview() {
  const { locale, t } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedCovers, setFailedCovers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getAnnouncements()
      .then((data) => {
        setAnnouncements(data);
      })
      .catch(() => {
        setAnnouncements([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section className="section-py section-bg-light" id="news">
      <Container>
        <SectionHeading
          tag={t.announcements.tag}
          title={t.announcements.heading}
          subtitle={t.announcements.subheading}
        />

        {loading ? (
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <LoadingSkeleton rows={3} />
            </div>
            <div className="col-12 col-md-6">
              <LoadingSkeleton rows={3} />
            </div>
          </div>
        ) : announcements.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={t.announcements.emptyTitle}
            description={t.announcements.emptyDesc}
          />
        ) : (
          <div className="row g-4">
            {announcements.map((item) => (
              <div key={item.id} className="col-12 col-md-6">
                <div className="bg-white rounded-4 border border-light-subtle shadow-sm h-100 d-flex flex-column overflow-hidden">
                  {item.coverImageUrl && !failedCovers[item.id] && (
                    <div className="position-relative w-100" style={{ height: '180px', backgroundColor: '#071927' }}>
                      <Image
                        src={item.coverImageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        style={{ objectFit: 'cover' }}
                        onError={() => setFailedCovers((prev) => ({ ...prev, [item.id]: true }))}
                      />
                      {item.images && item.images.length > 1 && (
                        <span
                          className="position-absolute bottom-0 end-0 m-2 px-2 py-1 rounded-pill bg-dark bg-opacity-75 text-white small fw-medium font-monospace"
                          style={{ fontSize: '0.72rem' }}
                        >
                          📷 {item.images.length} {locale === 'am' ? 'ፎቶዎች' : 'photos'}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-4 d-flex flex-column flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="badge badge-blue small">{item.category}</span>
                      <div className="d-flex align-items-center gap-1 text-muted small">
                        <Calendar size={14} />
                        <span>{item.date}</span>
                      </div>
                    </div>
                    <h3 className="h5 fw-bold text-dark mb-2">{item.title}</h3>
                    <p className="text-muted small mb-4 flex-grow-1" style={{ lineHeight: '1.6' }}>
                      {item.summary}
                    </p>
                    <Link
                      href={`/news/${item.slug}`}
                      className="text-primary fw-bold small text-decoration-none d-inline-flex align-items-center gap-1 mt-auto"
                    >
                      <span>{t.newsPage.readFull}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
