'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '../layout/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Laptop, Home, CheckCircle, ArrowRight } from 'lucide-react';

export function TutoringSection() {
  const { t } = useLanguage();

  return (
    <section className="section-py section-bg-light" id="tutoring">
      <Container>
        <SectionHeading
          tag={t.tutoring.tag}
          title={t.tutoring.heading}
          subtitle={t.tutoring.subheading}
          tagColor="cyan"
        />

        <div className="row g-4 align-items-stretch">
          {/* Track 1: Online */}
          <div className="col-12 col-md-6">
            <div className="feature-card d-flex flex-column h-100 p-0 overflow-hidden">
              <div className="position-relative w-100" style={{ aspectRatio: '16 / 9', backgroundColor: '#071927' }}>
                <Image
                  src="/images/tutoring/online-tutoring.jpg"
                  alt="Online tutoring session connecting student with dedicated remote instructor"
                  fill
                  sizes="(max-width: 768px) 100vw, 550px"
                  style={{ objectFit: 'cover' }}
                />
              </div>

              <div className="p-4 d-flex flex-column flex-grow-1">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="feature-icon-box mb-0">
                    <Laptop size={24} />
                  </div>
                  <h3 className="h5 fw-bold mb-0">{t.tutoring.onlineTitle}</h3>
                </div>
                <p className="text-muted flex-grow-1 small">{t.tutoring.onlineDesc}</p>
                <ul className="list-unstyled small text-muted d-flex flex-column gap-2 mb-4">
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle size={16} className="text-success flex-shrink-0" />
                    <span>Flexible schedules around school hours</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle size={16} className="text-success flex-shrink-0" />
                    <span>One-on-one and small group focus</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle size={16} className="text-success flex-shrink-0" />
                    <span>Interactive digital whiteboard & exercises</span>
                  </li>
                </ul>
                <Link href="/tutoring" className="btn-erkab btn-erkab-primary mt-auto">
                  <span>Request Online Tutoring</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Track 2: In-Person */}
          <div className="col-12 col-md-6">
            <div className="feature-card d-flex flex-column h-100 p-0 overflow-hidden">
              <div className="position-relative w-100" style={{ aspectRatio: '16 / 9', backgroundColor: '#071927' }}>
                <Image
                  src="/images/tutoring/in-person-tutoring.jpg"
                  alt="In-person tutoring and student mentoring at Gondar learning center"
                  fill
                  sizes="(max-width: 768px) 100vw, 550px"
                  style={{ objectFit: 'cover' }}
                />
              </div>

              <div className="p-4 d-flex flex-column flex-grow-1">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="feature-icon-box mb-0">
                    <Home size={24} />
                  </div>
                  <h3 className="h5 fw-bold mb-0">{t.tutoring.inPersonTitle}</h3>
                </div>
                <p className="text-muted flex-grow-1 small">{t.tutoring.inPersonDesc}</p>
                <ul className="list-unstyled small text-muted d-flex flex-column gap-2 mb-4">
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle size={16} className="text-success flex-shrink-0" />
                    <span>Home visits in Gondar or Erkab Learning Center</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle size={16} className="text-success flex-shrink-0" />
                    <span>Vetted, background-checked university mentors</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle size={16} className="text-success flex-shrink-0" />
                    <span>Elementary, High School, & University subjects</span>
                  </li>
                </ul>
                <Link href="/tutoring" className="btn-erkab btn-erkab-primary mt-auto">
                  <span>Request In-Person Tutoring</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
