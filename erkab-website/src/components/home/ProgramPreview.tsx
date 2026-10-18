'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container } from '../layout/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { ProgramGrid } from '../programs/ProgramGrid';
import { PROGRAMS, Program } from '@/lib/constants/programs';
import { getPrograms } from '@/features/programs/service';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ArrowRight } from 'lucide-react';

export function ProgramPreview() {
  const { t } = useLanguage();
  const [featuredPrograms, setFeaturedPrograms] = useState<Program[]>(PROGRAMS.slice(0, 4));

  useEffect(() => {
    let isMounted = true;
    getPrograms()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setFeaturedPrograms(data.slice(0, 4));
        }
      })
      .catch((err) => {
        console.warn('ProgramPreview: failed to fetch programs, using fallback', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="section-py section-bg-light" id="programs">
      <Container>
        <SectionHeading
          tag={t.programs.tag}
          title={t.programs.heading}
          subtitle={t.programs.subheading}
          tagColor="cyan"
        />

        <ProgramGrid programs={featuredPrograms} />

        <div className="text-center mt-4 pt-2">
          <Link href="/programs" className="btn-erkab btn-erkab-primary">
            <span>{t.programs.viewAll}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
