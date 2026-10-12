'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import { FormField } from '@/components/forms/FormField';
import { FormError } from '@/components/forms/FormError';
import { FormSuccess } from '@/components/forms/FormSuccess';
import { sendContactMessage, ContactMessageData } from '@/features/contact/service';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { MapPin, Mail, MessageSquare, Send, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const { locale, t } = useLanguage();
  const isAm = locale === 'am';

  const [formData, setFormData] = useState<ContactMessageData>({
    fullName: '',
    email: '',
    subject: '',
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
    if (!formData.fullName || !formData.email || !formData.message) {
      setError(
        isAm
          ? 'እባክዎ ሙሉ ስምዎን፣ ኢሜይልዎን እና መልእክትዎን ያስገቡ።'
          : 'Please provide your name, email, and message.'
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendContactMessage(formData);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Message sending failed';
      setError(
        isAm
          ? `${msg}። ሰርቨሩ በጊዜያዊነት የማይሰራ ከሆነ እባክዎ በቀጥታ በ info@erkab.org ያግኙን።`
          : `${msg}. If the backend server is offline, please email us directly at info@erkab.org.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        badge={t.contactPage.heroBadge}
        title={t.contactPage.heroTitle}
        description={t.contactPage.heroDesc}
      />

      <section className="section-py section-bg-white pt-0">
        <Container>
          <div className="row g-5">
            {/* Info Column */}
            <div className="col-lg-5">
              <div className="p-4 rounded-4 bg-light border border-light-subtle h-100">
                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-light-subtle">
                  <div className="brand-mark bg-white" style={{ width: '48px', height: '48px' }}>
                    <Image
                      src="/images/logo/erkab-logo-square.jpg"
                      alt="Erkab Official Logo"
                      width={48}
                      height={48}
                      className="brand-mark-img"
                    />
                  </div>
                  <div>
                    <h2 className="h5 fw-bold text-dark mb-0">{t.contactPage.infoTitle}</h2>
                    <span className="small text-muted">{t.contactPage.directorate}</span>
                  </div>
                </div>

                <div className="d-flex flex-column gap-4">
                  <div className="d-flex align-items-start gap-3">
                    <div className="p-2 rounded-3 bg-white text-primary border border-info-subtle">
                      <MapPin size={22} />
                    </div>
                    <div>
                      <strong className="d-block text-dark small">{t.contactPage.officeCampus}</strong>
                      <span className="text-muted small">
                        {t.footer.location}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div className="p-2 rounded-3 bg-white text-primary border border-info-subtle">
                      <Mail size={22} />
                    </div>
                    <div>
                      <strong className="d-block text-dark small">{t.contactPage.emailInquiries}</strong>
                      <span className="text-muted small">admissions@erkab.org</span>
                      <br />
                      <span className="text-muted small">info@erkab.org</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div className="p-2 rounded-3 bg-white text-primary border border-info-subtle">
                      <MessageSquare size={22} />
                    </div>
                    <div>
                      <strong className="d-block text-dark small">{t.contactPage.telegramChannel}</strong>
                      <span className="text-muted small">
                        {t.contactPage.telegramNotice}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 p-3 rounded-3 bg-white border border-light-subtle">
                  <span className="small fw-bold text-dark d-block mb-1">{t.contactPage.operatingHours}</span>
                  <span className="text-muted small">{t.contactPage.hoursValue}</span>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="col-lg-7">
              <div className="form-card">
                <h3 className="h5 fw-bold text-dark mb-3 text-start">{t.contactPage.formHeading}</h3>

                {submitted ? (
                  <FormSuccess
                    title={t.contactPage.successTitle}
                    message={t.contactPage.successMsg}
                  />
                ) : (
                  <form onSubmit={handleSubmit}>
                    <FormError message={error} />

                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <FormField
                          label={t.contactPage.fullName}
                          name="fullName"
                          placeholder={isAm ? 'ለምሳሌ፡ ዳዊት ኃይሌ' : 'e.g. Dawit Haile'}
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <FormField
                          label={isAm ? 'ኢሜይል አድራሻ' : 'Email Address'}
                          name="email"
                          type="email"
                          placeholder="e.g. dawit@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <FormField
                      label={t.contactPage.subject}
                      name="subject"
                      placeholder={
                        isAm
                          ? 'ለምሳሌ፡ ስለ ዌብ ዲቨሎፕመንት ስልጠና የሚቀርብ ጥያቄ'
                          : 'e.g. Question regarding Web Development Cohort'
                      }
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />

                    <FormField
                      label={t.contactPage.message}
                      name="message"
                      isTextArea
                      rows={5}
                      placeholder={
                        isAm
                          ? 'የአስተዳደር እና የስልጠና ቡድናችን በምን ሊረዳዎ ይችላል?'
                          : 'How can our admissions and training team help you?'
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
                          <span>{t.contactPage.sendingMessage}</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>{t.contactPage.sendMessageBtn}</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
