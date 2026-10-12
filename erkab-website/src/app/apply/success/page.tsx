'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { FormSuccess } from '@/components/forms/FormSuccess';
import { useLanguage } from '@/lib/i18n/LanguageContext';

function SuccessContent() {
  const searchParams = useSearchParams();
  const refNumber = searchParams.get('ref') || 'ERKAB-APP-PENDING';
  const { t } = useLanguage();

  return (
    <Container>
      <FormSuccess
        title={t.applySuccess.title}
        message={t.applySuccess.message}
        referenceNumber={refNumber}
      />
    </Container>
  );
}

export default function ApplySuccessPage() {
  const { locale } = useLanguage();

  return (
    <div className="section-py section-bg-light">
      <Suspense
        fallback={
          <div className="text-center py-5 text-muted">
            {locale === 'am' ? 'ማረጋገጫው በመጫን ላይ ነው...' : 'Loading confirmation...'}
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
