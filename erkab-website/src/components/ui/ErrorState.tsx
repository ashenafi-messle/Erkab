'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title,
  message,
  onRetry,
}: ErrorStateProps) {
  const { locale } = useLanguage();
  const isAm = locale === 'am';

  const defaultTitle = isAm ? 'ያልተጠበቀ ችግር አጋጥሟል' : 'Something went wrong';
  const tryAgainText = isAm ? 'እንደገና ይሞክሩ' : 'Try Again';

  return (
    <div className="state-box border-danger-subtle">
      <div className="state-icon text-danger" style={{ background: '#FEE2E2' }}>
        <AlertCircle size={28} />
      </div>
      <h3 className="h5 fw-bold mb-2 text-danger">{title || defaultTitle}</h3>
      <p className="text-muted mb-3 mx-auto" style={{ maxWidth: '480px' }}>
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary" icon={<RefreshCw size={16} />}>
          {tryAgainText}
        </Button>
      )}
    </div>
  );
}
