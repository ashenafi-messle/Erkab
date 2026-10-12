'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import {
  getTutoringPayment,
  TutoringPaymentDetails,
} from '@/features/tutoring/service';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Home,
  BookOpen,
  CalendarCheck,
  PhoneCall,
  BookmarkCheck,
} from 'lucide-react';

interface PaymentSuccessClientProps {
  reference: string;
}

export function PaymentSuccessClient({ reference: paymentReference }: PaymentSuccessClientProps) {
  const { locale, t } = useLanguage();
  const isAm = locale === 'am';

  const [payment, setPayment] = useState<TutoringPaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!paymentReference) return;

    let isMounted = true;
    async function verifyBackendStatus() {
      try {
        setLoading(true);
        setError('');
        const data = await getTutoringPayment(paymentReference);
        if (isMounted) {
          setPayment(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Failed to retrieve payment state';
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    verifyBackendStatus();

    return () => {
      isMounted = false;
    };
  }, [paymentReference]);

  const isConfirmed = payment && payment.status === 'SUCCEEDED';

  return (
    <>
      <PageHero
        badge={isConfirmed ? t.paymentSuccess.badge : t.paymentSuccess.pendingTitle}
        title={isConfirmed ? t.paymentSuccess.title : t.paymentSuccess.pendingTitle}
        description={isConfirmed ? t.paymentSuccess.subtitle : t.paymentSuccess.pendingMsg}
      />

      <section className="section-py section-bg-white pt-0">
        <Container>
          <div className="mx-auto" style={{ maxWidth: '720px' }}>
            {/* Loading backend verification */}
            {loading && (
              <div className="text-center py-5">
                <Loader2 size={36} className="text-primary spinner-border spinner-border-sm mb-3" />
                <p className="text-muted fw-semibold">{t.paymentSuccess.loadingMsg}</p>
              </div>
            )}

            {/* Error loading */}
            {!loading && error && (
              <div className="card border-danger shadow-sm rounded-4 p-4 text-center my-4">
                <AlertTriangle className="text-danger mx-auto mb-3" size={40} />
                <h3 className="h5 fw-bold text-danger mb-2">
                  {isAm ? 'ማረጋገጫውን ማግኘት አልተቻለም' : 'Could Not Verify Payment'}
                </h3>
                <p className="text-muted small mb-4">{error}</p>
                <div className="d-flex justify-content-center gap-3">
                  <Link href={`/tutoring/payment/${paymentReference}`} className="btn btn-primary d-inline-flex align-items-center gap-2">
                    <span>{t.paymentSuccess.goToPaymentBtn}</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            )}

            {/* Not Yet Succeeded / Pending */}
            {!loading && payment && !isConfirmed && (
              <div className="card border-warning shadow-sm rounded-4 p-4 p-md-5 text-center my-4 bg-light">
                <AlertTriangle className="text-warning mx-auto mb-3" size={44} />
                <h3 className="h5 fw-bold text-dark mb-2">
                  {t.paymentSuccess.pendingTitle}
                </h3>
                <p className="text-muted small mb-4">
                  {t.paymentSuccess.pendingMsg}
                </p>
                <div className="d-flex justify-content-center">
                  <Link
                    href={`/tutoring/payment/${paymentReference}`}
                    className="btn btn-warning text-dark fw-bold d-inline-flex align-items-center gap-2 px-4 py-2"
                  >
                    <span>{t.paymentSuccess.goToPaymentBtn}</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            )}

            {/* Confirmed Succeeded State */}
            {!loading && isConfirmed && (
              <div>
                {/* Official Confirmation Receipt Card */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white border border-light-subtle">
                  <div className="bg-success text-white p-4 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle bg-white bg-opacity-25 p-2 d-flex align-items-center justify-content-center">
                        <CheckCircle2 size={28} className="text-white" />
                      </div>
                      <div>
                        <h2 className="h6 fw-bold mb-0 text-white">{t.paymentSuccess.receiptTitle}</h2>
                        <span className="small text-white text-opacity-75 font-monospace">
                          {payment.transactionId}
                        </span>
                      </div>
                    </div>
                    <span className="badge bg-white text-success fw-bold px-3 py-2">
                      {t.paymentSuccess.statusValue}
                    </span>
                  </div>

                  <div className="p-4 p-md-5">
                    <div className="row g-4">
                      {/* Student Name */}
                      <div className="col-12 col-md-6 border-bottom pb-3">
                        <span className="text-muted small d-block mb-1">{t.paymentSuccess.studentName}</span>
                        <span className="fw-bold text-dark fs-6">{payment.studentName}</span>
                      </div>

                      {/* Academic Level */}
                      <div className="col-12 col-md-6 border-bottom pb-3">
                        <span className="text-muted small d-block mb-1">{t.demoPayment.academicLevel}</span>
                        <span className="fw-bold text-dark fs-6">{payment.gradeLevel}</span>
                      </div>

                      {/* Registration Reference */}
                      <div className="col-12 col-md-6 border-bottom pb-3">
                        <span className="text-muted small d-block mb-1">{t.paymentSuccess.tutoringRef}</span>
                        <span className="fw-bold text-primary font-monospace fs-6">
                          {payment.tutoringReference}
                        </span>
                      </div>

                      {/* Payment Reference */}
                      <div className="col-12 col-md-6 border-bottom pb-3">
                        <span className="text-muted small d-block mb-1">{t.paymentSuccess.paymentRef}</span>
                        <span className="fw-bold text-secondary font-monospace fs-6">
                          {payment.paymentReference}
                        </span>
                      </div>

                      {/* Amount Paid */}
                      <div className="col-12 col-md-6 border-bottom pb-3">
                        <span className="text-muted small d-block mb-1">{t.paymentSuccess.amount}</span>
                        <span className="fw-bold text-dark fs-5">
                          {payment.amount} {payment.currency}
                        </span>
                      </div>

                      {/* Payment Method */}
                      <div className="col-12 col-md-6 border-bottom pb-3">
                        <span className="text-muted small d-block mb-1">{t.paymentSuccess.paymentMethod}</span>
                        <span className="badge bg-light text-dark border fw-semibold">
                          {t.paymentSuccess.demoMethodValue}
                        </span>
                      </div>

                      {/* Subjects */}
                      <div className="col-12">
                        <span className="text-muted small d-block mb-1">{t.demoPayment.subjects}</span>
                        <span className="text-dark fw-semibold">{payment.subjects}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What Happens Next Card */}
                <div className="card border rounded-4 p-4 p-md-5 mb-4 bg-light shadow-sm">
                  <h3 className="h6 fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                    <CalendarCheck className="text-primary" size={20} />
                    <span>{t.paymentSuccess.nextStepsTitle}</span>
                  </h3>

                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-start gap-3">
                      <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-2 flex-shrink-0">
                        <BookOpen size={16} />
                      </div>
                      <p className="text-muted small mb-0 pt-1">{t.paymentSuccess.step1}</p>
                    </div>

                    <div className="d-flex align-items-start gap-3">
                      <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-2 flex-shrink-0">
                        <PhoneCall size={16} />
                      </div>
                      <p className="text-muted small mb-0 pt-1">{t.paymentSuccess.step2}</p>
                    </div>

                    <div className="d-flex align-items-start gap-3">
                      <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-2 flex-shrink-0">
                        <BookmarkCheck size={16} />
                      </div>
                      <p className="text-muted small mb-0 pt-1">{t.paymentSuccess.step3}</p>
                    </div>
                  </div>
                </div>

                {/* Return Buttons */}
                <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                  <Link href="/" className="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center gap-2 px-4 py-2">
                    <Home size={16} />
                    <span>{t.paymentSuccess.backHome}</span>
                  </Link>
                  <Link href="/tutoring" className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2 px-4 py-2">
                    <BookOpen size={16} />
                    <span>{t.paymentSuccess.backTutoring}</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
