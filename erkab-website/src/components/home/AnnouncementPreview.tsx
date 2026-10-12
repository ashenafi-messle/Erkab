'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container } from '../layout/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { EmptyState } from '../ui/EmptyState';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getAnnouncements, Announcement } from '@/features/announcements/service';
import { Bell, Calendar, ArrowRight } from 'lucide-react';

export function AnnouncementPreview() {
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

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
                <div className="p-4 bg-white rounded-4 border border-light-subtle shadow-sm h-100 d-flex flex-column">
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
  );
}
