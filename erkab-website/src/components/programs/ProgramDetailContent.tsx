'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import { Program, getLocalizedProgram } from '@/lib/constants/programs';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  Clock,
  Laptop,
  CheckCircle2,
  Briefcase,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Wrench,
} from 'lucide-react';

interface ProgramDetailContentProps {
  initialProgram: Program;
}

const FALLBACK_IMAGE = '/images/programs/web-development.jpg';

export function ProgramDetailContent({ initialProgram }: ProgramDetailContentProps) {
  const { locale, t } = useLanguage();
  const program = getLocalizedProgram(initialProgram, locale);
  const isAm = locale === 'am';
  const [imgSrc, setImgSrc] = useState<string>(program.image || FALLBACK_IMAGE);

  const modules = Array.isArray(program.modules) ? program.modules : [];
  const skills = Array.isArray(program.skills) ? program.skills : [];
  const careerPaths = Array.isArray(program.careerPaths) ? program.careerPaths : [];

  return (
    <>
      <PageHero
        badge={program.category || 'Professional Track'}
        title={program.title}
        description={program.summary}
      >
        <div className="d-flex flex-wrap gap-3 mt-3">
          <Link
            href={`/apply/student?program=${program.id}`}
            className="btn-erkab btn-erkab-lime"
          >
            <span>{t.programsPage.applyForTrack}</span>
            <ArrowRight size={16} />
          </Link>
          <Link href="/programs" className="btn-erkab btn-erkab-outline-white">
            <span>{t.common.viewAllPrograms}</span>
          </Link>
        </div>
      </PageHero>

      <section className="section-py section-bg-white pt-0">
        <Container>
          <div className="row g-5">
            {/* Left Content Column */}
            <div className="col-lg-8">
              {/* Program Cinematic Hero Image */}
              <div
                className="position-relative w-100 rounded-4 overflow-hidden mb-5 border border-light-subtle shadow-sm"
                style={{ aspectRatio: '16 / 9', maxHeight: '420px', backgroundColor: '#071927' }}
              >
                <Image
                  src={imgSrc}
                  alt={program.imageAlt || program.title || 'Program banner'}
                  fill
                  priority
                  sizes="(max-width: 991px) 100vw, 800px"
                  style={{ objectFit: 'cover' }}
                  onError={() => {
                    if (imgSrc !== FALLBACK_IMAGE) {
                      setImgSrc(FALLBACK_IMAGE);
                    }
                  }}
                />
              </div>

              {/* Overview */}
              <div className="mb-5">
                <h2 className="h4 fw-bold text-dark mb-3">{t.programsPage.overview}</h2>
                <p className="text-muted lead fs-6" style={{ lineHeight: '1.75' }}>
                  {program.description || program.summary}
                </p>
              </div>

              {/* Modules & Curriculum */}
              {modules.length > 0 && (
                <div className="mb-5">
                  <h3 className="h4 fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                    <BookOpen size={22} className="text-primary" />
                    <span>{t.programsPage.curriculumModules}</span>
                  </h3>
                  <div className="d-flex flex-column gap-3">
                    {modules.map((mod, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-3 bg-light border border-light-subtle d-flex align-items-start gap-3"
                      >
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white fw-bold small flex-shrink-0"
                          style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}
                        >
                          {i + 1}
                        </div>
                        <div className="fw-semibold text-dark small pt-1">{mod}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills acquired */}
              {skills.length > 0 && (
                <div className="mb-5">
                  <h3 className="h4 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <Wrench size={22} className="text-primary" />
                    <span>{t.programsPage.coreCompetencies}</span>
                  </h3>
                  <div className="d-flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="badge bg-light text-primary border border-info-subtle px-3 py-2 rounded-pill small fw-bold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Career Paths */}
              {careerPaths.length > 0 && (
                <div className="mb-5">
                  <h3 className="h4 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <Briefcase size={22} className="text-primary" />
                    <span>{t.programsPage.careerPathways}</span>
                  </h3>
                  <div className="row g-3">
                    {careerPaths.map((career, i) => (
                      <div key={i} className="col-12 col-sm-6">
                        <div className="p-3 bg-light rounded-3 border border-light-subtle d-flex align-items-center gap-2">
                          <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                          <span className="small fw-semibold text-dark">{career}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar Column */}
            <div className="col-lg-4">
              <div className="p-4 rounded-4 bg-light border border-light-subtle shadow-sm sticky-top" style={{ top: '100px' }}>
                <h4 className="h5 fw-bold text-dark mb-3 pb-2 border-bottom">
                  {isAm ? 'የስልጠናው ዝርዝር መረጃ' : 'Track Specifications'}
                </h4>

                <div className="d-flex flex-column gap-3 mb-4">
                  <div className="d-flex align-items-center gap-3">
                    <Clock size={18} className="text-primary" />
                    <div>
                      <small className="text-muted d-block">{t.programsPage.duration}</small>
                      <strong className="text-dark small">{program.duration || 'Standard Term'}</strong>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <Laptop size={18} className="text-primary" />
                    <div>
                      <small className="text-muted d-block">{t.programsPage.deliveryFormat}</small>
                      <strong className="text-dark small">{program.delivery || 'In-Person & Lab'}</strong>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <CheckCircle2 size={18} className="text-success" />
                    <div>
                      <small className="text-muted d-block">
                        {isAm ? 'የስኮላርሺፕ ድጋፍ' : 'Tuition Support'}
                      </small>
                      <strong className="text-success small">
                        {isAm ? '100% ሙሉ ስኮላርሺፕ' : '100% Scholarship Available'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-3 bg-white border border-secondary-subtle mb-4">
                  <div className="d-flex align-items-center gap-2 text-warning mb-1">
                    <ShieldAlert size={16} />
                    <span className="small fw-bold text-dark">{t.programsPage.prerequisites}</span>
                  </div>
                  <p className="text-muted small mb-0">{program.prerequisites || 'Basic computer literacy and enthusiasm to learn.'}</p>
                </div>

                <Link
                  href={`/apply/student?program=${program.id}`}
                  className="btn-erkab btn-erkab-lime w-100 justify-content-center"
                >
                  <span>{t.nav.applyNow}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
