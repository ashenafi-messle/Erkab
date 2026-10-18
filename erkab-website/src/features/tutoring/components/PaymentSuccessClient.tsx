'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ArrowLeft,
  GraduationCap,
  CalendarCheck,
  PhoneCall,
  BookmarkCheck,
} from 'lucide-react';

interface PaymentSuccessClientProps {
  reference: string;
}

export function PaymentSuccessClient({ reference: paymentReference }: PaymentSuccessClientProps) {
  const router = useRouter();
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
          // If transfer is not verified yet, redirect to bank transfer instructions
          if (data.status !== 'SUCCEEDED') {
            router.replace(`/tutoring/payment/${paymentReference}`);
          }
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
  }, [paymentReference, router]);

  const isConfirmed = payment && payment.status === 'SUCCEEDED';

  return (
    <>
      <PageHero
        badge={
          isConfirmed
            ? isAm
              ? 'ክፍያው ተረጋግጧል'
              : 'Payment Verified'
            : isAm
            ? 'ማረጋገጫ በመጠባበቅ ላይ'
            : 'Pending Bank Transfer'
        }
        title={
          isConfirmed
            ? isAm
              ? 'የቱቶሪንግ ምዝገባዎ ተረጋግጧል!'
              : 'Tutoring Registration Confirmed!'
            : isAm
            ? 'የባንክ ማስተላለፊያ መመሪያ'
            : 'Bank Transfer Instructions'
        }
        description={
          isConfirmed
            ? isAm
              ? 'የቱቶሪንግ ክፍያዎ በተሳካ ሁኔታ በባንክ ተረጋግጧል። የትምህርት ክፍለ ጊዜዎ ተመዝግቧል።'
              : 'Your tutoring fee transfer has been successfully verified by our academic team.'
            : isAm
            ? 'እባክዎ የባንክ ማስተላለፉን ያጠናቅቁ።'
            : 'Please complete your bank transfer to confirm registration.'
        }
      />

      <section className="section-py section-bg-white pt-0">
        <Container>
          <div className="mx-auto" style={{ maxWidth: '720px' }}>
            {/* Loading backend verification */}
            {loading && (
              <div className="text-center py-5">
                <Loader2 size={36} className="text-primary spinner-border spinner-border-sm mb-3" />
                <p className="text-muted fw-semibold">
                  {isAm ? 'የክፍያውን ሁኔታ ከሰርቨሩ በማረጋገጥ ላይ...' : 'Verifying payment status from server...'}
                </p>
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
                  <Link
                    href={`/tutoring/payment/${paymentReference}`}
                    className="btn btn-primary d-inline-flex align-items-center gap-2"
                  >
                    <span>{isAm ? 'ወደ ክፍያ መመሪያ ገጽ ይሂዱ' : 'View Transfer Instructions'}</span>
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
                  {isAm ? 'ክፍያው ገና አልተረጋገጠም' : 'Transfer Pending Verification'}
                </h3>
                <p className="text-muted small mb-4">
                  {isAm
                    ? 'ይህ የቱቶሪንግ ጥያቄ ገና በባንክ አልተረጋገጠም። እባክዎ በዳሸን ባንክ በኩል ማስተላለፉን ያጠናቅቁ።'
                    : 'This tutoring request is awaiting bank transfer. Please view the bank transfer details to complete your fee payment.'}
                </p>
                <div className="d-flex justify-content-center">
                  <Link
                    href={`/tutoring/payment/${paymentReference}`}
                    className="btn btn-warning text-dark fw-bold d-inline-flex align-items-center gap-2 px-4 py-2"
                  >
                    <span>{isAm ? 'ወደ ክፍያ መመሪያ ገጽ ይሂዱ' : 'View Bank Transfer Instructions'}</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            )}

            {/* Confirmed Succeeded State (Genuine transfers only) */}
            {!loading && isConfirmed && payment && (
              <div>
                <div className="text-center mb-4">
                  <div className="d-inline-flex p-3 rounded-circle bg-success bg-opacity-10 text-success mb-3 shadow-sm">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="h4 fw-bold text-dark mb-2">
                    {isAm ? 'የቱቶሪንግ ምዝገባዎ ተረጋግጧል!' : 'Tutoring Registration Confirmed!'}
                  </h2>
                  <p className="text-muted small">
                    {isAm
                      ? 'የባንክ ክፍያዎ በሰርቨሩ በትክክል ተረጋግጧል።'
                      : 'Your bank transfer has been confirmed in our records.'}
                  </p>
                </div>

                {/* Receipt Card */}
                <div className="card border rounded-4 shadow-sm overflow-hidden mb-4 bg-white">
                  <div className="bg-light border-bottom p-3 px-4 d-flex align-items-center justify-content-between">
                    <span className="fw-bold text-dark small text-uppercase">
                      {isAm ? 'ይፋዊ የማረጋገጫ ደረሰኝ' : 'Official Confirmation Receipt'}
                    </span>
                    <span className="badge bg-success text-white fw-bold">
                      {isAm ? 'የተከፈለ እና የተረጋገጠ' : 'CONFIRMED & VERIFIED'}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <div className="text-muted small">{t.tutoringPayment.studentName}</div>
                        <div className="fw-bold text-dark fs-6">{payment.studentName}</div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="text-muted small">{t.tutoringPayment.tutoringRef}</div>
                        <div className="fw-bold text-primary font-monospace fs-6">
                          {payment.tutoringReference}
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="text-muted small">{t.tutoringPayment.academicLevel}</div>
                        <div className="fw-bold text-dark fs-6">{payment.gradeLevel}</div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="text-muted small">{t.tutoringPayment.deliveryFormat}</div>
                        <div className="fw-bold text-dark fs-6">{payment.deliveryPreference}</div>
                      </div>

                      <div className="col-12 pt-3 border-top d-flex align-items-center justify-content-between">
                        <span className="fw-bold text-dark">
                          {isAm ? 'የተከፈለ መጠን' : 'Amount Paid'}
                        </span>
                        <span className="h4 fw-bold text-success mb-0">
                          {payment.amount} {payment.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Steps Card */}
                <div className="card border-0 bg-light rounded-4 p-4 mb-4">
                  <h3 className="h6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <CalendarCheck size={18} className="text-primary" />
                    <span>{isAm ? 'ቀጣዩ ሂደት ምንድን ነው?' : 'What Happens Next?'}</span>
                  </h3>
                  <div className="d-flex flex-column gap-3 small text-secondary">
                    <div className="d-flex align-items-start gap-2">
                      <span className="badge bg-primary rounded-circle p-1 px-2 text-white">1</span>
                      <span>
                        {isAm
                          ? 'የቱቶሪንግ አስተባባሪያችን የተማሪውን ፍላጎት ገምግሞ ብቃት ካለው መምህር ጋር ያገናኛል።'
                          : 'Our academic coordinator matches the student with a certified subject tutor.'}
                      </span>
                    </div>
                    <div className="d-flex align-items-start gap-2">
                      <span className="badge bg-primary rounded-circle p-1 px-2 text-white">2</span>
                      <span>
                        {isAm
                          ? 'የክፍለ ጊዜውን ሰዓት ለማስተካከል እና ትምህርቱን ለመጀመር በ24 ሰዓት ውስጥ በስልክ ወይም በቴሌግራም እንደውላለን።'
                          : 'We contact you via phone or Telegram within 24 hours to finalize schedules and setup Google Meet or home visits.'}
                      </span>
                    </div>
                    <div className="d-flex align-items-start gap-2">
                      <span className="badge bg-primary rounded-circle p-1 px-2 text-white">3</span>
                      <span>
                        {isAm
                          ? 'ለወደፊት ክትትል ወይም ጥያቄ የምዝገባ ቁጥርዎን በጥንቃቄ ይያዙ።'
                          : 'Please keep your registration reference number for all future communications.'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Back to Tutoring */}
                <div className="d-flex justify-content-center gap-3">
                  <Link href="/tutoring" className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
                    <ArrowLeft size={16} />
                    <span>{t.tutoringPayment.backToTutoring}</span>
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
