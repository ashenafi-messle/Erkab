'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Container } from '../layout/Container';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ShieldCheck, FileText, CheckCircle, ExternalLink, X, MapPin } from 'lucide-react';

export function CertificateSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <section className="section-py section-bg-light" id="official-recognition">
      <Container>
        {/* Section Heading */}
        <div className="section-header text-center mb-5">
          <div className="d-inline-flex align-items-center gap-2 mb-2">
            <span className="erkab-badge badge-blue">
              <ShieldCheck size={14} />
              <span>{t.certificate.tag}</span>
            </span>
          </div>
          <h2 className="section-title">{t.certificate.title}</h2>
          <p className="section-subtitle mx-auto" style={{ maxWidth: '640px' }}>
            {t.certificate.subtitle}
          </p>
        </div>

        {/* Certificate Card & Explanatory Layout */}
        <div className="row g-5 align-items-center">
          {/* Column 1: Certificate Document Card */}
          <div className="col-12 col-lg-6">
            <div
              className="p-3 p-md-4 rounded-4 bg-white shadow-sm border border-light-subtle position-relative"
              style={{
                boxShadow: '0 8px 30px rgba(8, 120, 185, 0.08)',
              }}
            >
              {/* Card Presentation Header with Erkab Brand Mark */}
              <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom border-light-subtle">
                <div className="d-flex align-items-center gap-2">
                  <div className="brand-mark" style={{ width: '40px', height: '40px' }}>
                    <Image
                      src="/images/logo/erkab-logo-square.jpg"
                      alt="Erkab Official Logo"
                      width={40}
                      height={40}
                      className="brand-mark-img"
                    />
                  </div>
                  <div>
                    <strong className="d-block text-dark small" style={{ lineHeight: '1.2' }}>
                      {t.brand.name}
                    </strong>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                      {t.certificate.cardHeader}
                    </span>
                  </div>
                </div>

                <span className="badge badge-lime small d-none d-sm-inline-flex">
                  {t.certificate.onFile}
                </span>
              </div>

              {/* Document Preview Container preserving original aspect ratio */}
              <div
                className="position-relative w-100 rounded-3 overflow-hidden border border-secondary-subtle"
                style={{
                  aspectRatio: '800 / 565',
                  backgroundColor: '#FCFCF9',
                }}
              >
                <Image
                  src="/images/organization/official-certificate-preview.svg"
                  alt={`Official institutional recognition certificate preview for ${t.brand.name}`}
                  fill
                  sizes="(max-width: 991px) 100vw, 550px"
                  style={{ objectFit: 'contain' }}
                />
              </div>

              {/* Action Bar */}
              <div className="mt-3 pt-3 border-top border-light-subtle d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2">
                <div className="d-flex align-items-center gap-2 text-muted small">
                  <FileText size={16} className="text-primary flex-shrink-0" />
                  <span>{t.certificate.recordNotice}</span>
                </div>

                <button
                  onClick={() => setModalOpen(true)}
                  className="btn-erkab btn-erkab-primary"
                  aria-haspopup="dialog"
                  aria-expanded={modalOpen}
                >
                  <span>{t.certificate.viewCertBtn}</span>
                  <ExternalLink size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: Context & Transparency Notice */}
          <div className="col-12 col-lg-6">
            <div className="pe-lg-3">
              <span className="badge badge-cyan mb-2">{t.certificate.transparencyTag}</span>
              <h3 className="h4 fw-bold text-dark mb-3">
                {t.certificate.transparencyHeading}
              </h3>
              <p className="text-muted small mb-3" style={{ lineHeight: '1.7' }}>
                {t.certificate.transparencyDesc}
              </p>

              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex align-items-start gap-2">
                  <CheckCircle size={18} className="text-success flex-shrink-0 mt-1" />
                  <div className="small">
                    <strong className="text-dark d-block">{t.certificate.point1Title}</strong>
                    <span className="text-muted">
                      {t.certificate.point1Desc}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-2">
                  <CheckCircle size={18} className="text-success flex-shrink-0 mt-1" />
                  <div className="small">
                    <strong className="text-dark d-block">{t.certificate.point2Title}</strong>
                    <span className="text-muted">
                      {t.certificate.point2Desc}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-2">
                  <CheckCircle size={18} className="text-success flex-shrink-0 mt-1" />
                  <div className="small">
                    <strong className="text-dark d-block">{t.certificate.point3Title}</strong>
                    <span className="text-muted">
                      {t.certificate.point3Desc}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-3 bg-white border border-light-subtle d-flex align-items-center gap-3">
                <MapPin size={22} className="text-primary flex-shrink-0" />
                <div className="small">
                  <span className="text-muted d-block">{t.certificate.physicalCampus}</span>
                  <strong className="text-dark">{t.footer.location}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Accessible Document Viewer Modal */}
      {modalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            zIndex: 1090,
            backgroundColor: 'rgba(7, 25, 39, 0.85)',
            backdropFilter: 'blur(8px)',
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="certificate-modal-title"
        >
          <div
            className="bg-white rounded-4 shadow-lg w-100 overflow-hidden d-flex flex-column"
            style={{ maxWidth: '850px', maxHeight: '92vh' }}
          >
            {/* Modal Header */}
            <div className="p-3 px-4 border-bottom d-flex align-items-center justify-content-between bg-light">
              <div className="d-flex align-items-center gap-2">
                <div className="brand-mark" style={{ width: '36px', height: '36px' }}>
                  <Image
                    src="/images/logo/erkab-logo-square.jpg"
                    alt="Erkab Official Logo"
                    width={36}
                    height={36}
                    className="brand-mark-img"
                  />
                </div>
                <div>
                  <h4 id="certificate-modal-title" className="h6 fw-bold mb-0 text-dark">
                    {t.brand.name}
                  </h4>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {t.certificate.modalSubtitle}
                  </small>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="btn btn-sm btn-outline-secondary rounded-circle p-2 d-inline-flex align-items-center justify-content-center"
                aria-label="Close certificate viewer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body with Full High-Res Document */}
            <div className="p-3 p-md-4 overflow-auto flex-grow-1 text-center bg-light">
              <div
                className="position-relative mx-auto rounded-3 shadow border border-secondary-subtle"
                style={{
                  maxWidth: '750px',
                  aspectRatio: '800 / 565',
                  backgroundColor: '#FCFCF9',
                }}
              >
                <Image
                  src="/images/organization/official-certificate-preview.svg"
                  alt={`Full official certificate document for ${t.brand.name}`}
                  fill
                  sizes="(max-width: 850px) 100vw, 750px"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 px-4 border-top bg-white d-flex align-items-center justify-content-between">
              <span className="small text-muted">
                {t.certificate.modalNotice}
              </span>
              <button
                onClick={() => setModalOpen(false)}
                className="btn-erkab btn-erkab-primary"
              >
                {t.common.done}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
