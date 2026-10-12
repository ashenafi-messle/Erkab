'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import { FormField } from '@/components/forms/FormField';
import { FormError } from '@/components/forms/FormError';
import { FormSuccess } from '@/components/forms/FormSuccess';
import { submitPartnershipInquiry, PartnershipInquiryData } from '@/features/partnerships/service';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Handshake, Send, Loader2, Building, Laptop, Users } from 'lucide-react';

export default function PartnershipsPage() {
  const { locale, t } = useLanguage();
  const isAm = locale === 'am';

  const [formData, setFormData] = useState<PartnershipInquiryData>({
    organizationName: '',
    contactPerson: '',
    email: '',
    phone: '',
    partnershipType: 'Funding / Scholarships',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.organizationName || !formData.contactPerson || !formData.email) {
      setError(
        isAm
          ? 'እባክዎ የተቋሙን ስም፣ የተወካይ ስም እና የስራ ኢሜይል ያስገቡ።'
          : 'Please provide organization name, contact person, and email.'
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      await submitPartnershipInquiry(formData);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      setError(
        isAm
          ? `${msg}። ሰርቨሩ በጊዜያዊነት የማይሰራ ከሆነ እባክዎ በቀጥታ በ partnerships@erkab.org ያግኙን።`
          : `${msg}. If the backend server is offline, please email partnerships directly at partnerships@erkab.org.`
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

          <div className="mx-auto" style={{ maxWidth: '680px' }}>
            <div className="form-card">
              <h3 className="h5 fw-bold text-dark mb-3 text-start d-flex align-items-center gap-2">
                <Handshake size={20} className="text-primary" />
                <span>{t.partnershipsPage.formTitle}</span>
              </h3>
              <p className="text-muted small text-start mb-4">
                {isAm
                  ? 'ተቋምዎ ከእርካብ ጋር እንዴት መስራት እንደሚፈልግ ከዚህ በታች ያሳውቁን።'
                  : 'Let us know how your organization would like to collaborate with Erkab.'}
              </p>

              {submitted ? (
                <FormSuccess
                  title={t.partnershipsPage.successTitle}
                  message={t.partnershipsPage.successMsg}
                />
              ) : (
                <form onSubmit={handleSubmit}>
                  <FormError message={error} />

                  <FormField
                    label={t.partnershipsPage.partnerOrgName}
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    required
                  />

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
                        label={isAm ? 'የስልክ ቁጥር' : 'Phone Number'}
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12 col-md-6">
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
                    </div>
                  </div>

                  <FormField
                    label={t.partnershipsPage.proposalSummary}
                    name="message"
                    isTextArea
                    rows={4}
                    placeholder={
                      isAm
                        ? 'ተቋምዎ ከእርካብ ጋር በምን መልኩ አጋርነት መፍጠር እንደሚፈልግ በአጭሩ ይግለጹ...'
                        : 'Describe how your organization would like to partner with Erkab...'
                    }
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-erkab btn-erkab-lime w-100 justify-content-center mt-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="spinner-border spinner-border-sm" />
                        <span>{t.common.submitting}</span>
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
