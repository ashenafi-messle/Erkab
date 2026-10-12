'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import {
  getDonationPayment,
  confirmDemoDonationPayment,
  DonationPaymentDetail,
} from '@/features/donations/service';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  RefreshCw,
} from 'lucide-react';

interface DonationCheckoutClientProps {
  paymentReference: string;
}

export function DonationCheckoutClient({ paymentReference }: DonationCheckoutClientProps) {
  const { locale, t } = useLanguage();
  const isAm = locale === 'am';

  const [payment, setPayment] = useState<DonationPaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [resultStatus, setResultStatus] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const loadPaymentDetails = async () => {
    if (!paymentReference) return;
    setLoading(true);
    setError('');
    try {
      const data = await getDonationPayment(paymentReference);
      setPayment(data);
      if (data.status === 'SUCCEEDED') {
        setResultStatus('SUCCEEDED');
      } else if (data.status === 'FAILED') {
        setResultStatus('FAILED');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve payment details';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentDetails();
  }, [paymentReference]);

  const handleSimulatePayment = async (simulateFailure: boolean = false) => {
    if (!paymentReference) return;
    setProcessing(true);
    setError('');
    try {
      const res = await confirmDemoDonationPayment(paymentReference, simulateFailure);
      setResultStatus(res.status);
      setResultMessage(res.message);
      await loadPaymentDetails();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction simulation failed';
      setError(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="section-py section-bg-light min-vh-100 d-flex align-items-center">
      <Container>
        <div className="mx-auto" style={{ maxWidth: '640px' }}>
          {/* Back link */}
          <Link
            href="/donations"
            className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1 mb-3"
          >
            <ArrowLeft size={16} />
            <span>{t.donationCheckout.backToDonations}</span>
          </Link>

          <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
            {/* Header banner */}
            <div className="bg-primary text-white p-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="badge bg-warning text-dark fw-bold text-uppercase px-2 py-1">
                  DEMO MODE ONLY
                </span>
                <span className="small opacity-75 font-monospace">{paymentReference}</span>
              </div>
              <h1 className="h4 fw-bold mb-1">{t.donationCheckout.title}</h1>
              <p className="small mb-0 opacity-75">{t.donationCheckout.subtitle}</p>
            </div>

            {/* Prominent Demo Notice */}
            <div className="p-3 bg-warning-subtle border-bottom border-warning-subtle text-dark small d-flex align-items-start gap-2">
              <AlertTriangle size={20} className="text-warning-emphasis flex-shrink-0 mt-0.5" />
              <div>
                <strong>{t.donationCheckout.demoAlert}</strong>
                <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
                  {t.donationCheckout.demoAlertDesc}
                </p>
              </div>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="text-center py-5 text-muted">
                  <Loader2 size={32} className="spinner-border text-primary mb-2" />
                  <p className="small mb-0">{t.common.loading}</p>
                </div>
              ) : error && !payment ? (
                <div className="alert alert-danger small mb-0">
                  <p className="mb-2">{error}</p>
                  <button
                    onClick={loadPaymentDetails}
                    className="btn btn-sm btn-outline-danger"
                  >
                    <RefreshCw size={14} className="me-1 inline" />
                    Retry
                  </button>
                </div>
              ) : payment ? (
                <div>
                  {/* Donation breakdown card */}
                  <div className="p-3 rounded-3 bg-light border border-light-subtle mb-4">
                    <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom">
                      <span className="text-muted small">{t.donationCheckout.amountDueLabel}</span>
                      <strong className="fs-5 text-primary">
                        {payment.amount.toLocaleString()} {payment.currency}
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom">
                      <span className="text-muted small">{t.donationCheckout.referenceLabel}</span>
                      <span className="font-monospace small text-dark fw-semibold">
                        {payment.donationReference}
                      </span>
                    </div>

                    {payment.campaign && (
                      <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom">
                        <span className="text-muted small">
                          {isAm ? 'የተመረጠው ዘመቻ' : 'Campaign Allocation'}
                        </span>
                        <span className="small text-dark fw-medium">
                          {payment.campaign.title}
                        </span>
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted small">{t.donationCheckout.statusLabel}</span>
                      <span
                        className={`badge ${
                          payment.status === 'SUCCEEDED'
                            ? 'bg-success'
                            : payment.status === 'FAILED'
                            ? 'bg-danger'
                            : 'bg-secondary'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>
                  </div>

                  {/* Outcome display */}
                  {resultStatus === 'SUCCEEDED' || payment.status === 'SUCCEEDED' ? (
                    <div className="text-center py-4 bg-success-subtle rounded-3 border border-success-subtle mb-4">
                      <CheckCircle2 size={48} className="text-success mb-2" />
                      <h4 className="h5 fw-bold text-success mb-1">
                        {t.donationCheckout.statusSucceeded}
                      </h4>
                      <p className="small text-muted mb-3">
                        {resultMessage || t.donationCheckout.receiptNotice}
                      </p>
                      {payment.verifiedAt && (
                        <span className="badge bg-white text-muted border font-monospace small mb-3">
                          Verified: {new Date(payment.verifiedAt).toLocaleString()}
                        </span>
                      )}
                      <div>
                        <Link href="/donations" className="btn btn-sm btn-outline-success">
                          {t.donationCheckout.backToDonations}
                        </Link>
                      </div>
                    </div>
                  ) : resultStatus === 'FAILED' || payment.status === 'FAILED' ? (
                    <div className="text-center py-4 bg-danger-subtle rounded-3 border border-danger-subtle mb-4">
                      <XCircle size={48} className="text-danger mb-2" />
                      <h4 className="h5 fw-bold text-danger mb-1">
                        {t.donationCheckout.statusFailed}
                      </h4>
                      <p className="small text-muted mb-3">
                        {resultMessage || t.donationCheckout.retryPrompt}
                      </p>
                      <button
                        onClick={() => handleSimulatePayment(false)}
                        disabled={processing}
                        className="btn btn-sm btn-outline-danger"
                      >
                        <RefreshCw size={14} className="me-1 inline" />
                        Retry Demo Payment
                      </button>
                    </div>
                  ) : (
                    <div>
                      {error && <div className="alert alert-danger small mb-3">{error}</div>}

                      <div className="d-grid gap-2">
                        <button
                          type="button"
                          onClick={() => handleSimulatePayment(false)}
                          disabled={processing}
                          className="btn btn-success py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                        >
                          {processing ? (
                            <>
                              <Loader2 size={18} className="spinner-border spinner-border-sm" />
                              <span>{t.donationCheckout.processing}</span>
                            </>
                          ) : (
                            <>
                              <CreditCard size={18} />
                              <span>{t.donationCheckout.simulateSuccessBtn}</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSimulatePayment(true)}
                          disabled={processing}
                          className="btn btn-outline-danger py-2 small d-flex align-items-center justify-content-center gap-2"
                        >
                          <AlertTriangle size={16} />
                          <span>{t.donationCheckout.simulateFailureBtn}</span>
                        </button>
                      </div>

                      <div className="mt-3 text-center">
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          <ShieldCheck size={14} className="me-1 inline text-muted" />
                          Simulated payment environment • Neon PostgreSQL transactions
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
