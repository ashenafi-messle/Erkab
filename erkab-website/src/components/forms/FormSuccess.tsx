'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface FormSuccessProps {
  title?: string;
  message?: string;
  referenceNumber?: string;
}

export function FormSuccess({
  title,
  message,
  referenceNumber,
}: FormSuccessProps) {
  const { locale, t } = useLanguage();
  const isAm = locale === 'am';

  const defaultTitle = isAm
    ? t.applySuccess.title
    : 'Application Submitted Successfully';
  const defaultMessage = isAm
    ? t.applySuccess.message
    : 'Thank you for applying. Your application has been logged into our admissions registry.';

  return (
    <div className="text-center p-4 p-md-5 bg-white rounded-4 border border-light-subtle shadow-sm my-4">
      <div
        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
        style={{
          width: '64px',
          height: '64px',
          background: 'rgba(199, 255, 69, 0.25)',
          color: '#1a4200',
        }}
      >
        <CheckCircle2 size={36} />
      </div>

      <h3 className="h4 fw-bold text-dark mb-2">{title || defaultTitle}</h3>
      <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '520px' }}>
        {message || defaultMessage}
      </p>

      {referenceNumber && (
        <div className="bg-light p-3 rounded-3 d-inline-block mb-4 border border-secondary-subtle">
          <small className="text-muted d-block text-uppercase fw-bold">
            {t.applySuccess.refLabel}
          </small>
          <span className="fs-5 fw-bold font-monospace text-primary">{referenceNumber}</span>
        </div>
      )}

      <div className="d-flex flex-wrap justify-content-center gap-3">
        <Link href="/" className="btn-erkab btn-erkab-primary">
          <span>{t.applySuccess.returnHome}</span>
          <ArrowRight size={16} />
        </Link>
        <Link href="/programs" className="btn-erkab btn-erkab-white border">
          <span>{t.applySuccess.exploreMoreTracks}</span>
        </Link>
      </div>
    </div>
  );
}
