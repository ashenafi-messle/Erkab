'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import { ProgramCard } from '@/components/programs/ProgramCard';
import { TechnologyShowcase } from '@/components/home/TechnologyShowcase';
import { PROGRAMS, Program } from '@/lib/constants/programs';
import { getPrograms } from '@/features/programs/service';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface ProgramsContentProps {
  initialPrograms?: Program[];
}

export function ProgramsContent({ initialPrograms }: ProgramsContentProps) {
  const { t } = useLanguage();
  const [programs, setPrograms] = useState<Program[]>(
    initialPrograms && initialPrograms.length > 0 ? initialPrograms : PROGRAMS
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadPrograms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPrograms();
      if (data && data.length > 0) {
        setPrograms(data);
      }
    } catch (err: any) {
      console.error('Failed to load training programs:', err);
      setError(err?.message || 'Failed to refresh programs from the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // If initialPrograms wasn't supplied or empty, trigger client fetch
    if (!initialPrograms || initialPrograms.length === 0) {
      loadPrograms();
    }
  }, [initialPrograms, loadPrograms]);

  return (
    <>
      <PageHero
        badge={t.programsPage.heroBadge}
        title={t.programsPage.heroTitle}
        description={t.programsPage.heroDesc}
      />

      <section className="section-py section-bg-white pt-0">
        <Container>
          {error && (
            <div className="alert alert-warning d-flex align-items-center justify-content-between mb-4" role="alert">
              <div className="d-flex align-items-center gap-2">
                <AlertCircle size={20} className="text-warning flex-shrink-0" />
                <span className="small">{error} — Showing cached programs.</span>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-dark d-inline-flex align-items-center gap-1"
                onClick={loadPrograms}
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'spinner-border spinner-border-sm' : ''} />
                <span>Retry</span>
              </button>
            </div>
          )}

          {loading && programs.length === 0 ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading programs...</span>
              </div>
              <p className="text-muted">Loading available training programs...</p>
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-5">
              <p className="lead text-muted mb-3">No active training programs are available at this moment.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={loadPrograms}
              >
                Check Again
              </button>
            </div>
          ) : (
            <div className="row g-4 mb-5">
              {programs.map((program) => (
                <div key={program.id || program.slug} className="col-12 col-md-6 col-lg-4">
                  <ProgramCard program={program} />
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Advanced AI & Technology Lab Showcase */}
      <TechnologyShowcase />
    </>
  );
}
