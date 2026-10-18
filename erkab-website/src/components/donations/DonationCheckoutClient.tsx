'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getDonationPayment } from '@/features/donations/service';
import {
  Building2,
  Copy,
  Check,
  ArrowLeft,
  ShieldCheck,
  Smartphone,
  Info,
  Heart,
  Landmark
} from 'lucide-react';

interface DonationCheckoutClientProps {
  paymentReference?: string;
  initialAmount?: number;
}

export function DonationCheckoutClient({
  paymentReference,
  initialAmount,
}: DonationCheckoutClientProps) {
  const { locale, t } = useLanguage();
  const isAm = locale === 'am';
  const searchParams = useSearchParams();

  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState<number | null>(initialAmount || null);
  const [campaignTitle, setCampaignTitle] = useState<string | null>(null);

  // Read amount and campaign from query parameters or look up reference if provided
  useEffect(() => {
    const queryAmount = searchParams?.get('amount');
    const queryCampaign = searchParams?.get('campaign');

    if (queryAmount) {
      const parsed = parseInt(queryAmount, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setAmount(parsed);
      }
    }

    if (queryCampaign) {
      setCampaignTitle(queryCampaign);
    }

    // If a reference was passed, look up the record details for informational display
    if (paymentReference) {
      getDonationPayment(paymentReference)
        .then((data) => {
          if (data?.amount) {
            setAmount(data.amount);
          }
          if (data?.campaign?.title) {
            setCampaignTitle(data.campaign.title);
          }
        })
        .catch(() => {
          // Gracefully fall back to query amount or general donation instructions
        });
    }
  }, [paymentReference, searchParams]);

  const handleCopyAccountNumber = async () => {
    const accountNumber = '3902411503011';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(accountNumber);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = accountNumber;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // In case copy fails, select text or let donor view number
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const backUrl = amount ? `/donations?amount=${amount}` : '/donations';

  return (
    <div className="section-py section-bg-light min-vh-100 d-flex align-items-center py-5">
      <Container>
        <div className="mx-auto" style={{ maxWidth: '680px' }}>
          {/* Back button that preserves the selected amount */}
          <div className="mb-3">
            <Link
              href={backUrl}
              className="text-decoration-none text-muted small d-inline-flex align-items-center gap-2 px-3 py-2 bg-white rounded-pill shadow-sm border border-light-subtle"
            >
              <ArrowLeft size={16} />
              <span className="fw-medium">{t.donationCheckout.backToDonations}</span>
            </Link>
          </div>

          <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
            {/* Header banner */}
            <div
              className="p-4 text-white"
              style={{
                background: 'linear-gradient(135deg, #075A91 0%, #0878B9 100%)',
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span
                  className="badge px-3 py-1 rounded-pill fw-semibold text-uppercase"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(4px)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px',
                  }}
                >
                  <Landmark size={13} className="me-1 inline" />
                  {isAm ? 'ቀጥተኛ የባንክ ማስተላለፊያ' : 'Direct Bank Transfer'}
                </span>
                {amount && (
                  <span
                    className="badge rounded-pill fw-bold"
                    style={{ backgroundColor: '#C7FF45', color: '#15171A' }}
                  >
                    {amount.toLocaleString()} ETB
                  </span>
                )}
              </div>
              <h1 className="h4 fw-bold mb-1">{t.donationCheckout.title}</h1>
              <p className="small mb-0 opacity-90">{t.donationCheckout.subtitle}</p>
            </div>

            <div className="p-4 p-md-5">
              {/* EXACT REQUIRED TEXT BLOCK */}
              <div
                className="p-4 rounded-4 mb-4 text-center border"
                style={{
                  backgroundColor: '#F5F6F8',
                  borderColor: '#E2E8F0',
                }}
              >
                <div className="d-inline-flex align-items-center justify-content-center p-2 rounded-circle mb-2 bg-white text-primary shadow-sm">
                  <Heart size={20} className="text-danger" />
                </div>

                {/* Exactly matching: Dear Donator */}
                <h2 className="h4 fw-bold text-dark mb-2">
                  Dear Donator
                </h2>

                {/* Exactly matching: you can direct transfer by using the organization Dashen Bank Account */}
                <p className="text-secondary mb-3 fs-6" style={{ maxWidth: '480px', margin: '0 auto' }}>
                  you can direct transfer by using the organization Dashen Bank Account
                </p>

                {/* Exactly matching: 3902411503011 */}
                <div className="my-3 py-2 px-3 bg-white rounded-3 border d-inline-block shadow-sm">
                  <div
                    className="fw-bold font-monospace text-primary tracking-wider"
                    style={{ fontSize: '1.75rem', letterSpacing: '2px' }}
                  >
                    3902411503011
                  </div>
                </div>

                {/* Exactly matching: Erkab Skill training Charty org (Preserve exact spelling) */}
                <div className="fw-bold text-dark fs-5 mt-2">
                  Erkab Skill training Charty org
                </div>
              </div>

              {/* Informational Donation Amount (if entered) */}
              {amount ? (
                <div className="p-3 rounded-3 bg-light border border-light-subtle mb-4 d-flex align-items-start gap-3">
                  <Info size={20} className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <div className="d-flex align-items-baseline gap-2 flex-wrap">
                      <span className="text-muted small fw-semibold">
                        {t.donationCheckout.selectedAmountLabel}:
                      </span>
                      <strong className="text-primary fs-5">
                        {amount.toLocaleString()} ETB
                      </strong>
                      {campaignTitle && (
                        <span className="badge bg-secondary-subtle text-secondary small">
                          {campaignTitle}
                        </span>
                      )}
                    </div>
                    <p className="text-muted small mb-0 mt-1" style={{ fontSize: '0.82rem' }}>
                      {t.donationCheckout.informationalAmountNotice}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Organized Bank Transfer Information Card */}
              <div className="card border rounded-4 overflow-hidden mb-4 shadow-sm">
                <div className="card-header bg-light py-3 px-4 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <Building2 size={18} className="text-primary" />
                    <span className="fw-bold text-dark small text-uppercase">
                      {isAm ? 'ይፋዊ የባንክ ሂሳብ ዝርዝር መረጃ' : 'Official Bank Account Details'}
                    </span>
                  </div>
                </div>

                <div className="card-body p-4">
                  <div className="row g-3">
                    {/* Bank Name */}
                    <div className="col-12 col-sm-6">
                      <div className="text-muted small mb-1">{t.donationCheckout.bankNameLabel}</div>
                      <div className="fw-bold text-dark fs-6 d-flex align-items-center gap-2">
                        <Landmark size={18} className="text-primary" />
                        <span>Dashen Bank (ዳሸን ባንክ)</span>
                      </div>
                    </div>

                    {/* Account Holder Name */}
                    <div className="col-12 col-sm-6">
                      <div className="text-muted small mb-1">{t.donationCheckout.accountHolderLabel}</div>
                      <div className="fw-bold text-dark fs-6 font-monospace">
                        Erkab Skill training Charty org
                      </div>
                    </div>

                    {/* Account Number with prominent Copy Button */}
                    <div className="col-12 pt-2 border-top">
                      <div className="text-muted small mb-1">{t.donationCheckout.accountNumberLabel}</div>
                      <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-between gap-3 p-3 bg-light rounded-3 border">
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="font-monospace fw-bold text-dark fs-4 text-break"
                            style={{ letterSpacing: '1px' }}
                          >
                            3902411503011
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleCopyAccountNumber}
                          className={`btn ${
                            copied
                              ? 'btn-success text-white'
                              : 'btn-primary text-white'
                          } d-inline-flex align-items-center justify-content-center gap-2 px-3 py-2 fw-semibold rounded-3 shadow-sm`}
                          style={{ minWidth: '190px', transition: 'all 0.2s ease-in-out' }}
                        >
                          {copied ? (
                            <>
                              <Check size={18} />
                              <span>{t.donationCheckout.accountNumberCopied}</span>
                            </>
                          ) : (
                            <>
                              <Copy size={18} />
                              <span>{t.donationCheckout.copyAccountNumberBtn}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step by step transfer guide */}
              <div className="p-4 rounded-4 bg-light border border-light-subtle mb-4">
                <h3 className="h6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <Smartphone size={18} className="text-primary" />
                  <span>{t.donationCheckout.howToTransferHeading}</span>
                </h3>

                <ol className="ps-3 mb-0 text-secondary small" style={{ lineHeight: 1.7 }}>
                  <li className="mb-2">{t.donationCheckout.step1}</li>
                  <li className="mb-2">{t.donationCheckout.step2}</li>
                  <li>{t.donationCheckout.step3}</li>
                </ol>
              </div>

              {/* Security Reminder */}
              <div className="p-3 rounded-3 bg-white border border-success-subtle text-dark small d-flex align-items-start gap-2 shadow-sm mb-4">
                <ShieldCheck size={20} className="text-success flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-success d-block mb-1">
                    {t.donationCheckout.securityHeading}
                  </strong>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.82rem' }}>
                    {t.donationCheckout.securityNotice}
                  </p>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="d-flex flex-column flex-sm-row gap-2 justify-content-between align-items-center pt-2">
                <Link
                  href={backUrl}
                  className="btn btn-outline-secondary w-100 w-sm-auto d-inline-flex align-items-center justify-content-center gap-2 py-2 px-4 rounded-3"
                >
                  <ArrowLeft size={16} />
                  <span>{t.donationCheckout.backToDonations}</span>
                </Link>

                <Link
                  href="/contact"
                  className="btn btn-outline-primary w-100 w-sm-auto d-inline-flex align-items-center justify-content-center gap-2 py-2 px-4 rounded-3"
                >
                  <span>{isAm ? 'ጥያቄ ካለዎት ያግኙን' : 'Have Questions? Contact Us'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
