'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import { FormField } from '@/components/forms/FormField';
import { FormError } from '@/components/forms/FormError';
import {
  createDonation,
  getDonationCampaigns,
  DonationCampaign,
} from '@/features/donations/service';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Heart, Loader2, Sparkles, Check, ArrowRight } from 'lucide-react';

const SUGGESTED_AMOUNTS = [250, 500, 1000, 2500];

function DonationsFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, t } = useLanguage();
  const isAm = locale === 'am';

  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [campaignSlug, setCampaignSlug] = useState<string>('');

  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Prefill amount if returning from checkout instructions
  useEffect(() => {
    const qAmount = searchParams?.get('amount');
    const qCampaign = searchParams?.get('campaign');

    if (qAmount) {
      const parsed = parseInt(qAmount, 10);
      if (!isNaN(parsed) && parsed > 0) {
        if (SUGGESTED_AMOUNTS.includes(parsed)) {
          setSelectedAmount(parsed);
          setCustomAmount('');
        } else {
          setSelectedAmount(parsed);
          setCustomAmount(parsed.toString());
        }
      }
    }

    if (qCampaign) {
      setCampaignSlug(qCampaign);
    }
  }, [searchParams]);

  useEffect(() => {
    getDonationCampaigns().then((data) => {
      setCampaigns(data);
    });
  }, []);

  const handleSelectAmount = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setSelectedAmount(parsed);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const finalAmount = customAmount ? parseInt(customAmount, 10) : selectedAmount;
    if (!finalAmount || isNaN(finalAmount) || finalAmount < 10) {
      setError(
        isAm
          ? 'እባክዎ ትክክለኛ የልገሳ መጠን ያስገቡ (ቢያንስ 10 ብር)።'
          : 'Please enter a valid donation amount (minimum 10 ETB).'
      );
      return;
    }

    if (!isAnonymous && (!donorName || !donorEmail)) {
      setError(
        isAm
          ? 'እባክዎ ሙሉ ስምዎን እና ኢሜይልዎን ያስገቡ ወይም ስም-አልባ የሚለውን ይምረጡ።'
          : 'Please enter your name and email, or choose to donate anonymously.'
      );
      return;
    }

    setLoading(true);

    try {
      // If contact information is provided, record the pending donation intent for recordkeeping
      if (donorEmail) {
        await createDonation({
          amount: finalAmount,
          currency: 'ETB',
          campaignSlug: campaignSlug || undefined,
          donorName: isAnonymous ? 'Anonymous Supporter' : donorName,
          email: donorEmail,
          phone: phone || undefined,
          message: message || undefined,
          isAnonymous,
        }).catch((err) => {
          console.warn('Could not record pending donation intent:', err?.message);
        });
      }

      // Navigate to the bank-transfer instructions page
      const params = new URLSearchParams();
      params.set('amount', finalAmount.toString());
      if (campaignSlug) params.set('campaign', campaignSlug);
      router.push(`/donations/checkout?${params.toString()}`);
    } catch {
      // In all cases, proceed to the bank transfer instructions
      const params = new URLSearchParams();
      params.set('amount', finalAmount.toString());
      router.push(`/donations/checkout?${params.toString()}`);
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
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-light-subtle">
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

              <form onSubmit={handleSubmit}>
                <FormError message={error} />

                {/* Amount Selection */}
                <div className="mb-4 text-start">
                  <label className="form-label fw-bold small text-dark d-block">
                    {t.donationsPage.donationAmount} <span className="text-danger">*</span>
                  </label>
                  <div className="row g-2 mb-2">
                    {SUGGESTED_AMOUNTS.map((amt) => {
                      const isSelected = selectedAmount === amt && !customAmount;
                      return (
                        <div key={amt} className="col-6 col-sm-3">
                          <button
                            type="button"
                            onClick={() => handleSelectAmount(amt)}
                            className={`btn w-100 py-2 fw-bold text-center border ${
                              isSelected
                                ? 'btn-primary text-white border-primary shadow-sm'
                                : 'btn-light text-dark border-secondary-subtle'
                            }`}
                          >
                            {isSelected && <Check size={14} className="me-1 inline" />}
                            {amt.toLocaleString()} ETB
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="input-group input-group-sm mt-2">
                    <span className="input-group-text bg-light text-muted">ETB</span>
                    <input
                      type="number"
                      min="10"
                      max="1000000"
                      placeholder={t.donationsPage.customAmount}
                      className="form-control"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                    />
                  </div>
                </div>

                {/* Impact Campaign Selection */}
                <div className="mb-3 text-start">
                  <label className="form-label fw-bold small text-dark d-block">
                    {t.donationsPage.campaignSelect}
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={campaignSlug}
                    onChange={(e) => setCampaignSlug(e.target.value)}
                  >
                    <option value="">{t.donationsPage.allCampaigns}</option>
                    {campaigns.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Anonymous Donation Toggle */}
                <div className="form-check form-switch mb-3 text-start">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="anonymousSwitch"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <label className="form-check-label small fw-semibold text-dark" htmlFor="anonymousSwitch">
                    {t.donationsPage.anonymousLabel}
                  </label>
                </div>

                {!isAnonymous && (
                  <FormField
                    label={t.donationsPage.donorName}
                    name="donorName"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    required
                  />
                )}

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <FormField
                      label={t.donationsPage.donorEmail}
                      name="donorEmail"
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      required={!isAnonymous}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <FormField
                      label={t.donationsPage.donorPhone}
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <FormField
                  label={t.donationsPage.donorMessage}
                  name="message"
                  isTextArea
                  rows={2}
                  placeholder={t.donationsPage.donorMessagePlaceholder}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
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
                      <span>{t.donationsPage.submitBtn}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

export default function DonationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      }
    >
      <DonationsFormContent />
    </Suspense>
  );
}
