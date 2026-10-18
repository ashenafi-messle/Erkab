'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import {
  getTutoringPayment,
  TutoringPaymentDetails,
} from '@/features/tutoring/service';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  Building2,
  Copy,
  Check,
  ArrowLeft,
  ShieldCheck,
  Smartphone,
  Info,
  Landmark,
  Loader2,
  AlertCircle,
  GraduationCap,
  User,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DemoPaymentClientProps {
  reference: string;
}

export function DemoPaymentClient({ reference: paymentReference }: DemoPaymentClientProps) {
  const { locale, t } = useLanguage();
  const isAm = locale === 'am';

  const [payment, setPayment] = useState<TutoringPaymentDetails | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [initialError, setInitialError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!paymentReference) {
      setLoadingInitial(false);
      setInitialError(
        isAm
          ? 'የክፍያ መለያ ቁጥር አልተገኘም። እባክዎ እንደገና ከቱቶሪንግ ገጽ ይሞክሩ።'
          : 'Missing payment reference. Please submit your tutoring request again from the tutoring page.'
      );
      return;
    }

    let isMounted = true;
    async function fetchPayment() {
      try {
        setLoadingInitial(true);
        setInitialError('');
        const data = await getTutoringPayment(paymentReference);
        if (isMounted) {
          setPayment(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message =
            err instanceof Error
              ? err.message
              : isAm
              ? 'የቱቶሪንግ ክፍያ መረጃውን ማግኘት አልተቻለም።'
              : 'Failed to retrieve tutoring payment details.';
          setInitialError(message);
        }
      } finally {
        if (isMounted) {
          setLoadingInitial(false);
        }
      }
    }

    fetchPayment();

    return () => {
      isMounted = false;
    };
  }, [paymentReference, isAm]);

  const handleCopyAccountNumber = async () => {
    const accountNumber = '3902411503011';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(accountNumber);
      } else {
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
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const dynamicAmount = payment?.amount ?? 500;
  const dynamicCurrency = payment?.currency ?? 'ETB';
  const formattedFee = `${dynamicAmount.toLocaleString()} ${dynamicCurrency}`;

  return (
    <div className="section-py section-bg-light min-vh-100 py-5">
      <Container>
        <div className="mx-auto" style={{ maxWidth: '720px' }}>
          {/* Back to Tutoring button */}
          <div className="mb-3">
            <Link
              href="/tutoring"
              className="text-decoration-none text-muted small d-inline-flex align-items-center gap-2 px-3 py-2 bg-white rounded-pill shadow-sm border border-light-subtle"
            >
              <ArrowLeft size={16} />
              <span className="fw-medium">{t.tutoringPayment.backToTutoring}</span>
            </Link>
          </div>

          {/* Loading State */}
          {loadingInitial && (
            <div className="card shadow-sm border-0 rounded-4 p-5 text-center bg-white my-4">
              <Loader2 size={36} className="text-primary spinner-border spinner-border-sm mx-auto mb-3" />
              <p className="text-muted fw-semibold mb-0">
                {isAm ? 'የቱቶሪንግ ክፍያ መረጃዎችን ከሰርቨር በመጫን ላይ...' : 'Loading tutoring transfer instructions...'}
              </p>
            </div>
          )}

          {/* Error State */}
          {!loadingInitial && initialError && (
            <div className="card border-danger shadow-sm rounded-4 p-4 text-center my-4 bg-white">
              <AlertCircle className="text-danger mx-auto mb-3" size={44} />
              <h3 className="h5 fw-bold text-danger mb-2">
                {isAm ? 'የቱቶሪንግ ጥያቄው አልተገኘም' : 'Tutoring Request Not Found'}
              </h3>
              <p className="text-muted small mb-4">{initialError}</p>
              <div className="d-flex justify-content-center">
                <Link href="/tutoring" className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
                  <ArrowLeft size={16} />
                  <span>{t.tutoringPayment.backToTutoring}</span>
                </Link>
              </div>
            </div>
          )}

          {/* Main Bank Transfer Instructions View */}
          {!loadingInitial && !initialError && (
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
              {/* Header Banner */}
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
                    {isAm ? `ቀጥታ የባንክ ማስተላለፍ — ${formattedFee}` : `Direct Bank Transfer — ${formattedFee}`}
                  </span>
                  <span
                    className="badge rounded-pill fw-bold"
                    style={{ backgroundColor: '#C7FF45', color: '#15171A' }}
                  >
                    {formattedFee}
                  </span>
                </div>
                <h1 className="h4 fw-bold mb-1">{t.tutoringPayment.title}</h1>
                <p className="small mb-0 opacity-90">{t.tutoringPayment.subtitle}</p>
              </div>

              <div className="p-4 p-md-5">
                {/* Tutoring Fee Context Notice */}
                <div className="alert alert-primary bg-primary bg-opacity-10 border-primary border-opacity-25 rounded-3 p-3 mb-4 d-flex align-items-start gap-3">
                  <GraduationCap className="text-primary flex-shrink-0 mt-1" size={22} />
                  <div className="small">
                    <strong className="text-primary d-block mb-1">
                      {isAm ? 'ይፋዊ የቱቶሪንግ ምዝገባ ክፍያ' : 'Official Tutoring Program Registration'}
                    </strong>
                    <span className="text-dark">
                      {isAm
                        ? 'ይህ ክፍያ ለተመዘገበው ተማሪ የተሰላ የቱቶሪንግ አገልግሎት ክፍያ ነው። ከዚህ በታች የተመለከተውን የድርጅቱን የዳሸን ባንክ ሂሳብ በመጠቀም ቀጥታ ማስተላለፍ ይችላሉ።'
                        : 'This transfer covers the tutoring program registration fee. Please use the organization Dashen Bank account details below to complete your direct transfer.'}
                    </span>
                  </div>
                </div>

                {/* EXACT REQUIRED TEXT BLOCK */}
                <div
                  className="p-4 rounded-4 mb-4 text-center border"
                  style={{
                    backgroundColor: '#F5F6F8',
                    borderColor: '#E2E8F0',
                  }}
                >
                  <div className="d-inline-flex align-items-center justify-content-center p-2 rounded-circle mb-2 bg-white text-primary shadow-sm">
                    <Landmark size={22} className="text-primary" />
                  </div>

                  {/* Dear Student */}
                  <h2 className="h4 fw-bold text-dark mb-2">
                    {t.tutoringPayment.dearStudent}
                  </h2>

                  {/* you can direct transfer by using the organization Dashen Bank Account */}
                  <p className="text-secondary mb-3 fs-6" style={{ maxWidth: '480px', margin: '0 auto' }}>
                    you can direct transfer by using the organization Dashen Bank Account
                  </p>

                  {/* 3902411503011 */}
                  <div className="my-3 py-2 px-3 bg-white rounded-3 border d-inline-block shadow-sm">
                    <div
                      className="fw-bold font-monospace text-primary tracking-wider"
                      style={{ fontSize: '1.75rem', letterSpacing: '2px' }}
                    >
                      3902411503011
                    </div>
                  </div>

                  {/* Erkab Skill training Charty org (Preserve exact spelling) */}
                  <div className="fw-bold text-dark fs-5 mt-2">
                    Erkab Skill training Charty org
                  </div>

                  {/* Selected Donation Amount: [selected amount] ETB */}
                  <div className="mt-3 pt-2 border-top border-light-subtle">
                    <div className="fw-bold text-primary fs-6">
                      Selected Donation Amount: {formattedFee}
                    </div>
                    <p className="text-muted small mb-0 mt-1" style={{ fontSize: '0.82rem' }}>
                      Informational value only — please enter this amount in your banking app when transferring.
                    </p>
                  </div>
                </div>

                {/* Student & Tutoring Request Summary */}
                {payment && (
                  <div className="card border rounded-4 overflow-hidden mb-4 shadow-sm bg-white">
                    <div className="card-header bg-light py-3 px-4 border-bottom d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <GraduationCap size={18} className="text-primary" />
                        <span className="fw-bold text-dark small text-uppercase">
                          {t.tutoringPayment.summaryTitle}
                        </span>
                      </div>
                      <span className="badge bg-warning-subtle text-warning-emphasis fw-bold">
                        {t.tutoringPayment.statusPending}
                      </span>
                    </div>

                    <div className="card-body p-4">
                      <div className="row g-3">
                        <div className="col-12 col-sm-6">
                          <div className="p-3 bg-light rounded-3 h-100">
                            <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                              <User size={15} />
                              <span>{t.tutoringPayment.studentName}</span>
                            </div>
                            <span className="fw-bold text-dark">{payment.studentName}</span>
                          </div>
                        </div>

                        <div className="col-12 col-sm-6">
                          <div className="p-3 bg-light rounded-3 h-100">
                            <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                              <Clock size={15} />
                              <span>{t.tutoringPayment.tutoringRef}</span>
                            </div>
                            <span className="fw-bold font-monospace text-primary">
                              {payment.tutoringReference}
                            </span>
                          </div>
                        </div>

                        <div className="col-12 col-sm-6">
                          <div className="p-3 bg-light rounded-3 h-100">
                            <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                              <GraduationCap size={15} />
                              <span>{t.tutoringPayment.academicLevel}</span>
                            </div>
                            <span className="fw-bold text-dark">{payment.gradeLevel}</span>
                          </div>
                        </div>

                        <div className="col-12 col-sm-6">
                          <div className="p-3 bg-light rounded-3 h-100">
                            <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                              <Layers size={15} />
                              <span>{t.tutoringPayment.deliveryFormat}</span>
                            </div>
                            <span className="fw-bold text-dark">{payment.deliveryPreference}</span>
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="p-3 bg-light rounded-3">
                            <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                              <Sparkles size={15} />
                              <span>{t.tutoringPayment.subjects}</span>
                            </div>
                            <span className="fw-semibold text-dark">{payment.subjects}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Organized Official Bank Account Details Card */}
                <div className="card border rounded-4 overflow-hidden mb-4 shadow-sm">
                  <div className="card-header bg-light py-3 px-4 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      <Building2 size={18} className="text-primary" />
                      <span className="fw-bold text-dark small text-uppercase">
                        {t.tutoringPayment.officialBankDetailsHeading}
                      </span>
                    </div>
                  </div>

                  <div className="card-body p-4">
                    <div className="row g-3">
                      {/* Bank Name */}
                      <div className="col-12 col-sm-6">
                        <div className="text-muted small mb-1">{t.tutoringPayment.bankNameLabel}</div>
                        <div className="fw-bold text-dark fs-6 d-flex align-items-center gap-2">
                          <Landmark size={18} className="text-primary" />
                          <span>Dashen Bank (ዳሸን ባንክ)</span>
                        </div>
                      </div>

                      {/* Account Name */}
                      <div className="col-12 col-sm-6">
                        <div className="text-muted small mb-1">{t.tutoringPayment.accountNameLabel}</div>
                        <div className="fw-bold text-dark fs-6 font-monospace">
                          Erkab Skill training Charty org
                        </div>
                      </div>

                      {/* Account Number with prominent Copy Button */}
                      <div className="col-12 pt-2 border-top">
                        <div className="text-muted small mb-1">{t.tutoringPayment.accountNumberLabel}</div>
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
                              copied ? 'btn-success' : 'btn-outline-primary'
                            } d-inline-flex align-items-center justify-content-center gap-2 px-3 py-2 fw-semibold shadow-sm`}
                            style={{ minWidth: '190px' }}
                          >
                            {copied ? (
                              <>
                                <Check size={18} />
                                <span>{t.tutoringPayment.copied}</span>
                              </>
                            ) : (
                              <>
                                <Copy size={18} />
                                <span>{t.tutoringPayment.copyAccountNumberBtn}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How to Complete Your Transfer */}
                <div className="card border-0 bg-light rounded-4 p-4 mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Smartphone size={20} className="text-primary" />
                    <h3 className="h6 fw-bold text-dark mb-0">
                      {t.tutoringPayment.howToTransferHeading}
                    </h3>
                  </div>

                  <ol className="ps-3 mb-0 small text-secondary d-flex flex-column gap-2">
                    <li>{t.tutoringPayment.step1}</li>
                    <li>{t.tutoringPayment.step2}</li>
                    <li>{t.tutoringPayment.step3}</li>
                  </ol>
                </div>

                {/* Security & Safety Information */}
                <div className="p-3 rounded-3 border border-secondary-subtle bg-white d-flex align-items-start gap-3 mb-4">
                  <ShieldCheck size={22} className="text-success mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="fw-bold text-dark mb-1 small text-uppercase">
                      {t.tutoringPayment.securityHeading}
                    </h4>
                    <p className="text-muted small mb-0">
                      {t.tutoringPayment.securityNotice}
                    </p>
                  </div>
                </div>

                {/* Pending Verification Notice */}
                <div className="p-3 rounded-3 bg-light border border-light-subtle d-flex align-items-start gap-2 mb-4">
                  <Info size={18} className="text-primary mt-1 flex-shrink-0" />
                  <p className="text-muted small mb-0">
                    {t.tutoringPayment.pendingTransferNotice}
                  </p>
                </div>

                {/* Navigation Back */}
                <div className="text-center pt-2">
                  <Link
                    href="/tutoring"
                    className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 px-4 py-2"
                  >
                    <ArrowLeft size={16} />
                    <span>{t.tutoringPayment.backToTutoring}</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
