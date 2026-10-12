'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import {
  getTutoringPayment,
  confirmDemoPayment,
  TutoringPaymentDetails,
} from '@/features/tutoring/service';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  ShieldAlert,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  User,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DemoPaymentClientProps {
  reference: string;
}

export function DemoPaymentClient({ reference: paymentReference }: DemoPaymentClientProps) {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const isAm = locale === 'am';

  const [payment, setPayment] = useState<TutoringPaymentDetails | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [initialError, setInitialError] = useState('');

  // Simulation controls & execution state
  const [simulatedOutcome, setSimulatedOutcome] = useState<'SUCCESS' | 'FAILURE'>('SUCCESS');
  const [processing, setProcessing] = useState(false);
  const [failureError, setFailureError] = useState('');

  useEffect(() => {
    if (!paymentReference) return;

    let isMounted = true;
    async function fetchPayment() {
      try {
        setLoadingInitial(true);
        setInitialError('');
        const data = await getTutoringPayment(paymentReference);
        if (isMounted) {
          setPayment(data);
          if (data.status === 'SUCCEEDED') {
            router.replace(`/tutoring/payment/${paymentReference}/success`);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Failed to retrieve payment details';
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
  }, [paymentReference, router]);

  const handlePayNow = async () => {
    if (!paymentReference || processing) return;

    setProcessing(true);
    setFailureError('');

    try {
      // Simulate realistic latency
      await new Promise((r) => setTimeout(r, 1200));

      const result = await confirmDemoPayment(paymentReference, simulatedOutcome);

      if (result.success && result.status === 'SUCCEEDED') {
        router.push(`/tutoring/payment/${paymentReference}/success`);
      } else {
        setFailureError(
          result.message ||
            (isAm
              ? 'የተመሰለው ክፍያ አልተሳካም። እባክዎ ውጤቱን ወደ "የተሳካ ክፍያ" ቀይረው እንደገና ይሞክሩ።'
              : 'The simulated transaction was rejected. You may retry or toggle the simulation outcome.')
        );
        if (payment) {
          setPayment({ ...payment, status: 'FAILED' });
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Demo payment verification failed';
      setFailureError(message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <PageHero
        badge={t.demoPayment.badge}
        title={t.demoPayment.title}
        description={t.demoPayment.subtitle}
      />

      <section className="section-py section-bg-white pt-0">
        <Container>
          <div className="mx-auto" style={{ maxWidth: '720px' }}>
            {/* Loading State */}
            {loadingInitial && (
              <div className="text-center py-5">
                <Loader2 size={36} className="text-primary spinner-border spinner-border-sm mb-3" />
                <p className="text-muted fw-semibold">
                  {isAm ? 'የክፍያ መረጃዎችን ከሰርቨር በመጫን ላይ...' : 'Loading payment details from server...'}
                </p>
              </div>
            )}

            {/* Error Loading Payment */}
            {!loadingInitial && initialError && (
              <div className="card border-danger shadow-sm rounded-4 p-4 text-center my-4">
                <AlertCircle className="text-danger mx-auto mb-3" size={40} />
                <h3 className="h5 fw-bold text-danger mb-2">
                  {isAm ? 'የክፍያ መረጃውን ማግኘት አልተቻለም' : 'Payment Record Not Found'}
                </h3>
                <p className="text-muted small mb-4">{initialError}</p>
                <div className="d-flex justify-content-center gap-3">
                  <Link href="/tutoring" className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
                    <ArrowLeft size={16} />
                    <span>{t.demoPayment.backToForm}</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Main Payment View */}
            {!loadingInitial && payment && (
              <div>
                {/* Demo Disclaimer Alert */}
                <div
                  className="alert alert-warning border border-warning-subtle rounded-4 p-3 mb-4 d-flex align-items-start gap-3 shadow-sm"
                  role="alert"
                >
                  <ShieldAlert className="text-warning flex-shrink-0 mt-1" size={24} />
                  <div>
                    <strong className="d-block text-dark fw-bold mb-1">
                      {isAm ? 'ይህ የሙከራ (Demo) ክፍያ ስርዓት ነው' : 'Simulated Demo Payment Notice'}
                    </strong>
                    <p className="small text-muted mb-0">{t.demoPayment.disclaimerNotice}</p>
                  </div>
                </div>

                {/* Failure Notice if payment failed */}
                {failureError && (
                  <div
                    className="alert alert-danger border border-danger-subtle rounded-4 p-3 mb-4 d-flex align-items-start gap-3 shadow-sm"
                    role="alert"
                  >
                    <AlertCircle className="text-danger flex-shrink-0 mt-1" size={22} />
                    <div className="flex-grow-1">
                      <strong className="d-block text-danger fw-bold mb-1">
                        {t.demoPayment.failedTitle}
                      </strong>
                      <p className="small text-dark mb-0">{failureError}</p>
                    </div>
                  </div>
                )}

                {/* Registration & Amount Summary Card */}
                <div className="card border rounded-4 shadow-sm overflow-hidden mb-4 bg-white">
                  <div className="bg-light border-bottom p-3 px-4 d-flex align-items-center justify-content-between">
                    <span className="fw-bold text-dark small text-uppercase tracking-wider">
                      {t.demoPayment.summaryTitle}
                    </span>
                    <span className="badge bg-secondary text-white fw-bold">
                      {t.demoPayment.modeNotice}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="row g-3 mb-4">
                      {/* Student Name */}
                      <div className="col-12 col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                            <User size={15} />
                            <span>{t.demoPayment.studentName}</span>
                          </div>
                          <span className="fw-bold text-dark">{payment.studentName}</span>
                        </div>
                      </div>

                      {/* Registration Ref */}
                      <div className="col-12 col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                            <Clock size={15} />
                            <span>{t.demoPayment.tutoringRef}</span>
                          </div>
                          <span className="fw-bold font-monospace text-primary">
                            {payment.tutoringReference}
                          </span>
                        </div>
                      </div>

                      {/* Academic Level */}
                      <div className="col-12 col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                            <BookOpen size={15} />
                            <span>{t.demoPayment.academicLevel}</span>
                          </div>
                          <span className="fw-bold text-dark">{payment.gradeLevel}</span>
                        </div>
                      </div>

                      {/* Delivery Mode */}
                      <div className="col-12 col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                            <Layers size={15} />
                            <span>{t.demoPayment.deliveryFormat}</span>
                          </div>
                          <span className="fw-bold text-dark">{payment.deliveryPreference}</span>
                        </div>
                      </div>

                      {/* Subjects */}
                      <div className="col-12">
                        <div className="p-3 bg-light rounded-3">
                          <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                            <Sparkles size={15} />
                            <span>{t.demoPayment.subjects}</span>
                          </div>
                          <span className="fw-semibold text-dark">{payment.subjects}</span>
                        </div>
                      </div>
                    </div>

                    {/* Calculated Fee Breakdown */}
                    <div className="p-4 rounded-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
                      <div>
                        <span className="text-muted small fw-semibold d-block">
                          {t.demoPayment.feeAmount}
                        </span>
                        <span className="text-secondary small">
                          {isAm ? 'በሰርቨር የተቀመጠ አስተማማኝ ተመን' : 'Verified server-calculated standard rate'}
                        </span>
                      </div>
                      <div className="text-sm-end">
                        <span className="h2 fw-bold text-primary mb-0 d-block">
                          {payment.amount} {payment.currency}
                        </span>
                        <span className="badge bg-primary bg-opacity-25 text-primary fw-semibold">
                          {payment.paymentMode} MODE
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Demo Simulation Controls (Testing Tool) */}
                <div className="card border rounded-4 p-3 p-md-4 mb-4 bg-light">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="small fw-bold text-dark">
                      {t.demoPayment.simulationOptionsTitle}
                    </span>
                    <span className="badge bg-warning text-dark small fw-semibold">
                      {isAm ? 'ለሙከራ ብቻ' : 'Test Mode Only'}
                    </span>
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <button
                        type="button"
                        disabled={processing}
                        onClick={() => setSimulatedOutcome('SUCCESS')}
                        className={`btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 border text-start ${
                          simulatedOutcome === 'SUCCESS'
                            ? 'btn-success text-white shadow-sm'
                            : 'btn-outline-secondary bg-white text-dark'
                        }`}
                      >
                        <CheckCircle2 size={16} />
                        <span className="small fw-semibold">{t.demoPayment.simulateSuccess}</span>
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        type="button"
                        disabled={processing}
                        onClick={() => setSimulatedOutcome('FAILURE')}
                        className={`btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 border text-start ${
                          simulatedOutcome === 'FAILURE'
                            ? 'btn-danger text-white shadow-sm'
                            : 'btn-outline-secondary bg-white text-dark'
                        }`}
                      >
                        <AlertCircle size={16} />
                        <span className="small fw-semibold">{t.demoPayment.simulateFailure}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex flex-column gap-3">
                  <button
                    type="button"
                    disabled={processing}
                    onClick={handlePayNow}
                    className="btn btn-primary py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 rounded-3 shadow-sm"
                  >
                    {processing ? (
                      <>
                        <Loader2 size={20} className="spinner-border spinner-border-sm" />
                        <span>{t.demoPayment.processingMsg}</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={20} />
                        <span>
                          {payment.status === 'FAILED' ? t.demoPayment.retryBtn : t.demoPayment.payNowBtn}
                        </span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <div className="text-center mt-2">
                    <Link
                      href="/tutoring"
                      className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1 hover-primary"
                    >
                      <ArrowLeft size={14} />
                      <span>{t.demoPayment.backToForm}</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
