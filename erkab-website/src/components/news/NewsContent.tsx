'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import { Announcement, getLocalizedAnnouncement } from '@/features/announcements/service';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Calendar, ArrowRight, Newspaper, Tag } from 'lucide-react';

interface NewsContentProps {
  initialAnnouncements: Announcement[];
}

export function NewsContent({ initialAnnouncements }: NewsContentProps) {
  const { locale, t } = useLanguage();
  const isAm = locale === 'am';
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [failedCovers, setFailedCovers] = useState<Record<string, boolean>>({});

  const localizedItems = initialAnnouncements.map((a) => getLocalizedAnnouncement(a, locale));

  const categories = ['ALL', ...Array.from(new Set(localizedItems.map((a) => a.category).filter(Boolean)))];

  const filteredAnnouncements =
    selectedCategory === 'ALL'
      ? localizedItems
      : localizedItems.filter((item) => item.category === selectedCategory);

  return (
    <>
      <PageHero
        badge={t.newsPage.heroBadge}
        title={t.newsPage.heroTitle}
        description={t.newsPage.heroDesc}
      />

      <section className="section-py section-bg-white pt-0">
        <Container>
          {/* Category Filter */}
          {categories.length > 2 && (
            <div className="d-flex flex-wrap gap-2 mb-4 justify-content-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
                    selectedCategory === cat
                      ? 'btn-primary text-white shadow-sm'
                      : 'btn-light text-muted border border-light-subtle'
                  }`}
                >
                  {cat === 'ALL' ? (isAm ? 'ሁሉም ዜናዎች' : 'All Updates') : cat}
                </button>
              ))}
            </div>
          )}

          {filteredAnnouncements.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <Newspaper size={40} className="text-secondary-subtle mb-3 mx-auto" />
              <p className="small mb-0">{t.newsPage.emptyNotice}</p>
            </div>
          ) : (
            <div className="row g-4">
              {filteredAnnouncements.map((item) => (
                <div key={item.id} className="col-12 col-md-6 col-lg-4">
                  <div className="bg-white rounded-4 border border-light-subtle shadow-sm h-100 d-flex flex-column overflow-hidden transition-all hover-shadow">
                    {item.coverImageUrl && !failedCovers[item.id] && (
                      <div className="position-relative w-100" style={{ height: '180px', backgroundColor: '#071927' }}>
                        <Image
                          src={item.coverImageUrl}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          style={{ objectFit: 'cover' }}
                          onError={() => setFailedCovers((prev) => ({ ...prev, [item.id]: true }))}
                        />
                        {item.images && item.images.length > 1 && (
                          <span
                            className="position-absolute bottom-0 end-0 m-2 px-2 py-1 rounded-pill bg-dark bg-opacity-75 text-white small fw-medium font-monospace"
                            style={{ fontSize: '0.72rem' }}
                          >
                            📷 {item.images.length} {isAm ? 'ፎቶዎች' : 'photos'}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="p-4 d-flex flex-column flex-grow-1">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <span className="badge badge-blue small d-inline-flex align-items-center gap-1">
                          <Tag size={12} />
                          <span>{item.category}</span>
                        </span>
                        <div className="d-flex align-items-center gap-1 text-muted small">
                          <Calendar size={14} />
                          <span>{item.date}</span>
                        </div>
                      </div>

                      <h2 className="h6 fw-bold text-dark mb-2 line-clamp-2">{item.title}</h2>
                      <p className="text-muted small mb-4 flex-grow-1 line-clamp-3" style={{ lineHeight: '1.6' }}>
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
    </>
  );
}
