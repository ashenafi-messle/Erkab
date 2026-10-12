'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import { FormField } from '@/components/forms/FormField';
import { FormError } from '@/components/forms/FormError';
import { FormSuccess } from '@/components/forms/FormSuccess';
import { submitDonationPledge, DonationPledgeData } from '@/features/donations/service';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Heart, Loader2, Sparkles } from 'lucide-react';

export default function DonationsPage() {
  const { locale, t } = useLanguage();
  const isAm = locale === 'am';

  const [formData, setFormData] = useState<DonationPledgeData>({
    donorName: '',
    donorEmail: '',
    phone: '',
    supportArea: 'Student Scholarships',
    amountOrItemsDescription: '',
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
    if (!formData.donorName || !formData.donorEmail || !formData.amountOrItemsDescription) {
      setError(
        isAm
          ? 'እባክዎ ስምዎን፣ ኢሜይልዎን እና የድጋፍ መግለጫውን ያስገቡ።'
          : 'Please provide your name, email, and pledge details.'
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      await submitDonationPledge(formData);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      setError(
        isAm
          ? `${msg}። ሰርቨሩ በጊዜያዊነት የማይሰራ ከሆነ እባክዎ በቀጥታ በ donations@erkab.org ያግኙን።`
          : `${msg}. If the backend server is offline, please contact donations directly at donations@erkab.org.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        badge={t.donationsPage.heroBadge}
        title={t.donationsPage.heroTitle}
        description={t.donationsPage.heroDesc}
      />

      <section className="section-py section-bg-white pt-0">
        <Container>
          <div className="row g-4 mb-5">
            <div className="col-12 col-md-4">
              <div className="p-4 rounded-4 bg-light border border-light-subtle h-100">
                <span className="badge badge-lime mb-2">{isAm ? 'ቀዳሚ ተፅዕኖ' : 'Primary Impact'}</span>
                <h3 className="h6 fw-bold text-dark mb-2">{t.donationsPage.scholarshipCard}</h3>
                <p className="text-muted small mb-0">
                  {t.donationsPage.scholarshipCardDesc}
                </p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-4 rounded-4 bg-light border border-light-subtle h-100">
                <span className="badge badge-blue mb-2">{isAm ? 'መሰረተ ልማት' : 'Infrastructure'}</span>
                <h3 className="h6 fw-bold text-dark mb-2">{t.donationsPage.hardwareCard}</h3>
                <p className="text-muted small mb-0">
                  {t.donationsPage.hardwareCardDesc}
                </p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-4 rounded-4 bg-light border border-light-subtle h-100">
                <span className="badge badge-cyan mb-2">{isAm ? 'ዘላቂነት' : 'Resilience'}</span>
                <h3 className="h6 fw-bold text-dark mb-2">{t.donationsPage.solarCard}</h3>
                <p className="text-muted small mb-0">
                  {t.donationsPage.solarCardDesc}
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto" style={{ maxWidth: '680px' }}>
            <div className="form-card">
              <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom border-light-subtle">
                <div className="brand-mark bg-white" style={{ width: '44px', height: '44px' }}>
                  <Image
                    src="/images/logo/erkab-logo-square.jpg"
                    alt="Erkab Official Logo"
                    width={44}
                    height={44}
                    className="brand-mark-img"
                  />
                </div>
                <div>
                  <h3 className="h5 fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <Heart size={18} className="text-danger" />
                    <span>{t.donationsPage.formHeading}</span>
                  </h3>
                  <span className="small text-muted">{t.donationsPage.fundSubtitle}</span>
                </div>
              </div>
              <p className="text-muted small text-start mb-4">
                {t.donationsPage.formNotice}
              </p>

              {submitted ? (
                <FormSuccess
                  title={t.donationsPage.successTitle}
                  message={t.donationsPage.successMsg}
                />
              ) : (
                <form onSubmit={handleSubmit}>
                  <FormError message={error} />

                  <FormField
                    label={t.donationsPage.donorName}
                    name="donorName"
                    value={formData.donorName}
                    onChange={handleChange}
                    required
                  />

                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <FormField
                        label={t.donationsPage.donorEmail}
                        name="donorEmail"
                        type="email"
                        value={formData.donorEmail}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <FormField
                        label={t.donationsPage.donorPhone}
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <FormField
                    label={t.donationsPage.supportArea}
                    name="supportArea"
                    value={formData.supportArea}
                    onChange={handleChange}
                    options={[
                      { value: 'Student Scholarships', label: t.donationsPage.area1 },
                      { value: 'Computer Lab Equipment', label: t.donationsPage.area2 },
                      { value: 'Solar Power & Internet', label: t.donationsPage.area3 },
                      { value: 'General Operations', label: t.donationsPage.area4 },
                    ]}
                    required
                  />

                  <FormField
                    label={t.donationsPage.pledgeDesc}
                    name="amountOrItemsDescription"
                    isTextArea
                    rows={3}
                    placeholder={t.donationsPage.pledgePlaceholder}
                    value={formData.amountOrItemsDescription}
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
                        <span>{t.donationsPage.submitting}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>{t.donationsPage.submitBtn}</span>
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
