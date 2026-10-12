'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { FileQuestion, ArrowRight } from 'lucide-react';

export default function NotFound() {
  const { locale, t } = useLanguage();
  const isAm = locale === 'am';

  return (
    <div className="section-py text-center">
      <Container>
        <div
          className="p-5 bg-white rounded-4 border border-light-subtle shadow-sm mx-auto"
          style={{ maxWidth: '600px' }}
        >
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
            style={{ width: '64px', height: '64px', background: '#F1F5F9', color: '#0878B9' }}
          >
            <FileQuestion size={36} />
          </div>
          <h1 className="h3 fw-bold mb-2">
            {isAm ? 'ገጹ አልተገኘም' : 'Page Not Found'}
          </h1>
          <p className="text-muted mb-4">
            {isAm
              ? 'የፈለጉት ገጽ አልተገኘም ወይም ወደ ሌላ አድራሻ ተዛውሯል።'
              : 'The page you are looking for does not exist or may have been moved.'}
          </p>
          <Link href="/" className="btn-erkab btn-erkab-primary">
            <span>{t.applySuccess.returnHome}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </div>
  );
}
