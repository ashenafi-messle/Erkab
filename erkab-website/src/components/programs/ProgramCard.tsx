'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Program, getLocalizedProgram } from '@/lib/constants/programs';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ArrowRight, Clock } from 'lucide-react';

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const { locale, t } = useLanguage();
  const p = getLocalizedProgram(program, locale);

  return (
    <div className="program-card">
      {/* Subject-Specific Photographic Container */}
      <div className="program-card-image-wrap">
        <Image
          src={p.image}
          alt={p.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="program-card-image"
          loading="lazy"
        />

        {/* Category Overlay */}
        <div className="program-card-badge-top-left">
          <span className="badge bg-dark bg-opacity-75 text-white border border-light-subtle small">
            {p.category}
          </span>
        </div>

        {/* Scholarship Badge */}
        {p.scholarship && (
          <div className="program-card-badge-top-right">
            <span className="badge badge-lime small">{t.common.scholarshipTrack}</span>
          </div>
        )}
      </div>

      <div className="program-card-body">
        <h3 className="program-card-title">{p.title}</h3>
        <p className="program-card-desc">{p.summary}</p>

        <div className="program-card-meta mt-auto">
          <div className="d-flex align-items-center gap-1 text-muted small">
            <Clock size={14} />
            <span>{p.duration}</span>
          </div>
          <Link
            href={`/programs/${p.slug}`}
            className="text-primary fw-bold small text-decoration-none d-inline-flex align-items-center gap-1"
          >
            <span>{t.programsPage.exploreTrack}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
