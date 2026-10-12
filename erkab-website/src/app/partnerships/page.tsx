'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import { FormField } from '@/components/forms/FormField';
import { FormError } from '@/components/forms/FormError';
import { FormSuccess } from '@/components/forms/FormSuccess';
import { submitPartnershipRequest } from '@/features/partnerships/service';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  Handshake,
  Send,
  Loader2,
  Building,
  Laptop,
  Users,
  UploadCloud,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function PartnershipsPage() {
  const { locale, t } = useLanguage();
  const isAm = locale === 'am';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: 'NGO',
    contactPerson: '',
    email: '',
    phone: '',
    country: 'Ethiopia',
    city: 'Gondar',
    partnershipType: 'Funding / Scholarships',
    proposal: '',
  });

  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedReference, setSubmittedReference] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const files = e.target.files;
    if (!files || files.length === 0) {
      setLicenseFile(null);
      return;
    }

    const file = files[0];
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setFileError(
        isAm
          ? 'እባክዎ ትክክለኛ የሰነድ አይነት (PDF, JPEG, ወይም PNG) ይምረጡ።'
          : 'Please select a valid document format (PDF, JPEG, or PNG).'
      );
      setLicenseFile(null);
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setFileError(
        isAm
          ? 'የፋይሉ መጠን ከ 10MB መብለጥ የለበትም።'
          : 'File size exceeds maximum permitted limit of 10MB.'
      );
      setLicenseFile(null);
      return;
    }

    setLicenseFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.organizationName || !formData.contactPerson || !formData.email || !formData.phone) {
      setError(
        isAm
          ? 'እባክዎ የተቋሙን ስም፣ የተወካይ ስም፣ የስራ ኢሜይል እና የስልክ ቁጥር ያስገቡ።'
          : 'Please provide organization name, contact person, work email, and phone number.'
      );
      return;
    }

    if (!licenseFile) {
      setError(
        isAm
          ? 'የተቋሙ ህጋዊ ፈቃድ ሰነድ ማስገባት አስገዳጅ ነው። እባክዎ ሰነዱን ይጫኑ።'
          : 'Organization license document is strictly required. Please upload your document.'
      );
      return;
    }

    setLoading(true);

    try {
      const res = await submitPartnershipRequest({
        organizationName: formData.organizationName,
        organizationType: formData.organizationType,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        partnershipType: formData.partnershipType,
        proposal: formData.proposal,
        organizationLicense: licenseFile,
      });

      const ref = res?.reference || res?.referenceNumber || (res as any)?.data?.reference || (res as any)?.data?.referenceNumber;
      if (ref) {
        setSubmittedReference(ref);
      } else {
        throw new Error('Partnership submission succeeded but reference was not returned.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      setError(
        isAm
          ? `${msg}። እባክዎ እንደገና ይሞክሩ ወይም በ partnerships@erkab.org ያግኙን።`
          : `${msg}. Please retry or contact partnerships directly at partnerships@erkab.org.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        badge={t.partnershipsPage.heroBadge}
        title={t.partnershipsPage.heroTitle}
        description={t.partnershipsPage.heroDesc}
      />

      <section className="section-py section-bg-white pt-0">
        <Container>
          {/* Partnership Collaboration Photography */}
          <div
            className="position-relative w-100 rounded-4 overflow-hidden mb-5 shadow-sm border border-light-subtle"
            style={{ aspectRatio: '16 / 8', maxHeight: '420px', backgroundColor: '#071927' }}
          >
            <Image
              src="/images/partnerships/collaboration.jpg"
              alt="Strategic partners and young entrepreneurs collaborating on vocational impact in Ethiopia"
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              style={{ objectFit: 'cover' }}
            />
          </div>

          <div className="row g-4 mb-5">
            <div className="col-12 col-md-4">
              <div className="p-4 rounded-4 bg-light border border-light-subtle h-100">
                <Building size={24} className="text-primary mb-3" />
                <h3 className="h6 fw-bold text-dark mb-2">{t.partnershipsPage.pillar1Title}</h3>
                <p className="text-muted small mb-0">
                  {t.partnershipsPage.pillar1Desc}
                </p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-4 rounded-4 bg-light border border-light-subtle h-100">
                <Laptop size={24} className="text-primary mb-3" />
                <h3 className="h6 fw-bold text-dark mb-2">{t.partnershipsPage.pillar2Title}</h3>
                <p className="text-muted small mb-0">
                  {t.partnershipsPage.pillar2Desc}
                </p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-4 rounded-4 bg-light border border-light-subtle h-100">
                <Users size={24} className="text-primary mb-3" />
                <h3 className="h6 fw-bold text-dark mb-2">{t.partnershipsPage.pillar3Title}</h3>
                <p className="text-muted small mb-0">
                  {t.partnershipsPage.pillar3Desc}
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto" style={{ maxWidth: '720px' }}>
            <div className="form-card">
              <h3 className="h5 fw-bold text-dark mb-3 text-start d-flex align-items-center gap-2">
                <Handshake size={20} className="text-primary" />
                <span>{t.partnershipsPage.formTitle}</span>
              </h3>
              <p className="text-muted small text-start mb-4">
                {isAm
                  ? 'ተቋምዎ ከእርካብ ጋር በምን መልኩ አጋር መሆን እንደሚፈልግ እና ህጋዊ የፈቃድ ሰነድዎን ከዚህ በታች ያቅርቡ።'
                  : 'Submit your organization collaboration scope and official business/NGO license document.'}
              </p>

              {submittedReference ? (
                <div className="p-4 bg-light rounded-4 border border-success-subtle text-center">
                  <div className="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mb-3">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="h5 fw-bold text-dark mb-2">{t.partnershipsPage.successTitle}</h4>
                  <p className="text-muted small mb-3">{t.partnershipsPage.successMsg}</p>
                  <div className="p-3 bg-white rounded-3 border d-inline-block text-start mb-3">
                    <span className="text-muted small d-block">{t.partnershipsPage.referenceLabel}:</span>
                    <strong className="text-primary font-monospace fs-6">{submittedReference}</strong>
                  </div>
                  <p className="text-muted small mb-0">
                    {isAm
                      ? 'እባክዎ ይህንን የማጣቀሻ ቁጥር ለቀጣይ ክትትል ያስቀምጡ።'
                      : 'Please save this reference number for future communication.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <FormError message={error} />

                  <div className="row g-3">
                    <div className="col-12 col-md-7">
                      <FormField
                        label={t.partnershipsPage.partnerOrgName}
                        name="organizationName"
                        value={formData.organizationName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-5">
                      <FormField
                        label={t.partnershipsPage.orgType}
                        name="organizationType"
                        value={formData.organizationType}
                        onChange={handleChange}
                        options={[
                          { value: 'NGO', label: t.partnershipsPage.orgTypeNGO },
                          { value: 'Private Company', label: t.partnershipsPage.orgTypeCompany },
                          { value: 'University', label: t.partnershipsPage.orgTypeUniversity },
                          { value: 'Government', label: t.partnershipsPage.orgTypeGovernment },
                          { value: 'Other', label: t.partnershipsPage.orgTypeOther },
                        ]}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <FormField
                        label={t.partnershipsPage.contactPerson}
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <FormField
                        label={t.partnershipsPage.workEmail}
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <FormField
                        label={t.partnershipsPage.phone}
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <FormField
                        label={t.partnershipsPage.city}
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <FormField
                    label={t.partnershipsPage.partnerType}
                    name="partnershipType"
                    value={formData.partnershipType}
                    onChange={handleChange}
                    options={[
                      { value: 'Funding / Scholarships', label: t.partnershipsPage.typeSponsor },
                      { value: 'Internships & Hiring', label: t.partnershipsPage.typeHiring },
                      { value: 'Curriculum & Mentorship', label: t.partnershipsPage.typeCurriculum },
                      { value: 'Other', label: t.partnershipsPage.typeOther },
                    ]}
                    required
                  />

                  {/* Organization License Document Upload — Required */}
                  <div className="mb-3 text-start">
                    <label className="form-label fw-bold small text-dark d-flex align-items-center justify-content-between">
                      <span>
                        {t.partnershipsPage.licenseDoc}{' '}
                        <span className="text-danger">*</span>
                      </span>
                      <span className="badge bg-light text-muted border small">PDF, JPG, PNG (Max 10MB)</span>
                    </label>

                    <div
                      className={`p-4 rounded-3 border-2 border-dashed text-center bg-light position-relative ${
                        fileError ? 'border-danger' : licenseFile ? 'border-success bg-success-subtle' : 'border-secondary-subtle'
                      }`}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="d-none"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                      />

                      {licenseFile ? (
                        <div className="d-flex align-items-center justify-content-center gap-2 text-success">
                          <FileCheck size={28} />
                          <div className="text-start">
                            <span className="fw-bold d-block text-dark">{licenseFile.name}</span>
                            <span className="small text-muted">
                              {(licenseFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for secure upload
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <UploadCloud size={32} className="text-muted mb-2" />
                          <p className="small text-dark fw-semibold mb-1">
                            {t.partnershipsPage.dragDropText}
                          </p>
                          <p className="small text-muted mb-0">
                            {t.partnershipsPage.licenseHelp}
                          </p>
                        </div>
                      )}
                    </div>

                    {fileError && <div className="text-danger small mt-1">{fileError}</div>}

                    <div className="mt-2 p-2 rounded bg-light-subtle border border-light-subtle d-flex align-items-start gap-2">
                      <ShieldCheck size={16} className="text-primary mt-1 flex-shrink-0" />
                      <span className="text-muted" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                        {t.partnershipsPage.privacyNotice}
                      </span>
                    </div>
                  </div>

                  <FormField
                    label={t.partnershipsPage.proposalSummary}
                    name="proposal"
                    isTextArea
                    rows={4}
                    placeholder={t.partnershipsPage.proposalPlaceholder}
                    value={formData.proposal}
                    onChange={handleChange}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-erkab btn-erkab-lime w-100 justify-content-center mt-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="spinner-border spinner-border-sm" />
                        <span>{t.partnershipsPage.submitting}</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>{t.partnershipsPage.submitBtn}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
