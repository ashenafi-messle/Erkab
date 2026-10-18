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
import { MapPin, Mail, Clock, Send, Loader2, ShieldCheck, RefreshCw, Sparkles, Building2 } from 'lucide-react';

export default function ContactPage() {
  const { locale, t } = useLanguage();
  const isAm = locale === 'am';

  const [formData, setFormData] = useState<ContactMessageData>({
    fullName: '',
    email: '',
    phone: '',
    category: 'GENERAL_INQUIRY',
    subject: '',
    message: '',
    hp_organization: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const categories = [
    { value: 'GENERAL_INQUIRY', label: t.contactPage.catGeneral },
    { value: 'TRAINING_PROGRAMS', label: t.contactPage.catPrograms },
    { value: 'SCHOLARSHIP_APPLICATION', label: t.contactPage.catScholarship },
    { value: 'TUTORING', label: t.contactPage.catTutoring },
    { value: 'PARTNERSHIP_MENTORSHIP', label: t.contactPage.catPartnership },
    { value: 'DONATIONS', label: t.contactPage.catDonations },
    { value: 'TECHNICAL_SUPPORT', label: t.contactPage.catSupport },
    { value: 'OTHER', label: t.contactPage.catOther },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errors.fullName = isAm ? 'ሙሉ ስምዎን ያስገቡ (ቢያንስ 2 ፊደላት)' : 'Full name is required (at least 2 characters)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = isAm ? 'ትክክለኛ የኢሜይል አድራሻ ያስገቡ' : 'Please enter a valid email address';
    }

    if (!formData.category) {
      errors.category = isAm ? 'እባክዎ የጥያቄውን ዘርፍ ይምረጡ' : 'Please select an inquiry category';
    }

    if (!formData.subject.trim() || formData.subject.trim().length < 3) {
      errors.subject = isAm ? 'የመልእክቱ ርዕስ ቢያንስ 3 ፊደላት መሆን አለበት' : 'Subject must be at least 3 characters';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errors.message = isAm
        ? 'መልእክትዎ ቢያንስ 10 ፊደላት መሆን አለበት'
        : 'Message must be at least 10 characters long';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError(
        isAm
          ? 'እባክዎ የተዘረዘሩትን የተሳሳቱ ወይም ያልተሞሉ መረጃዎች ያርሙ።'
          : 'Please review and correct the highlighted fields before submitting.'
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await sendContactMessage({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined,
        category: formData.category,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        hp_organization: formData.hp_organization,
      });

      if (response && response.success && response.data?.referenceCode) {
        setSubmittedRef(response.data.referenceCode);
      } else {
        throw new Error(response?.message || 'Submission confirmation could not be verified');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Message transmission failed';
      setError(
        isAm
          ? `${msg}። እባክዎ እንደገና ይሞክሩ ወይም በቀጥታ በ info@erkab.org ያግኙን።`
          : `${msg}. Please retry, or email us directly at info@erkab.org.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      category: 'GENERAL_INQUIRY',
      subject: '',
      message: '',
      hp_organization: '',
    });
    setSubmittedRef(null);
    setError('');
    setFieldErrors({});
  };

  return (
    <>
      {/* 1. Page Introduction Hero */}
      <PageHero
        badge={t.contactPage.heroBadge}
        title={t.contactPage.heroTitle}
        description={t.contactPage.heroDesc}
      />

      {/* 2. Main Contact Body */}
      <section className="section-py section-bg-white pt-0">
        <Container>
          <div className="row g-4 g-lg-5">
            {/* Info Column */}
            <div className="col-lg-5">
              <div className="p-4 p-md-5 rounded-4 bg-light border border-light-subtle h-100 shadow-sm d-flex flex-column justify-content-between">
                <div>
                  {/* Organization Identity Header */}
                  <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-light-subtle">
                    <div className="brand-mark bg-white shadow-sm flex-shrink-0" style={{ width: '52px', height: '52px' }}>
                      <Image
                        src="/images/logo/erkab-logo-square.jpg"
                        alt="Erkab Official Logo"
                        width={52}
                        height={52}
                        className="brand-mark-img rounded-circle"
                      />
                    </div>
                    <div>
                      <h2 className="h6 fw-bold text-dark mb-0">{t.contactPage.infoTitle}</h2>
                      <span className="small text-muted d-block">{t.contactPage.directorate}</span>
                    </div>
                  </div>

                  {/* Contact Directory Cards */}
                  <div className="d-flex flex-column gap-4">
                    {/* Physical Location */}
                    <div className="d-flex align-items-start gap-3">
                      <div className="p-2 rounded-3 bg-white text-primary border border-info-subtle shadow-xs flex-shrink-0 mt-1">
                        <MapPin size={22} />
                      </div>
                      <div>
                        <strong className="d-block text-dark small fw-bold mb-1">{t.contactPage.officeCampus}</strong>
                        <span className="text-muted small d-block" style={{ lineHeight: '1.55' }}>
                          {t.contactPage.officeLocation}
                        </span>
                      </div>
                    </div>

                    {/* Verified Emails */}
                    <div className="d-flex align-items-start gap-3">
                      <div className="p-2 rounded-3 bg-white text-primary border border-info-subtle shadow-xs flex-shrink-0 mt-1">
                        <Mail size={22} />
                      </div>
                      <div>
                        <strong className="d-block text-dark small fw-bold mb-1">{t.contactPage.emailInquiries}</strong>
                        <div className="d-flex flex-column gap-1">
                          <a
                            href="mailto:admissions@erkab.org"
                            className="text-primary text-decoration-none small d-inline-flex align-items-center gap-1"
                          >
                            <span>admissions@erkab.org</span>
                            <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                              ({isAm ? 'ቅበላ እና ስኮላርሺፕ' : 'Admissions & Cohorts'})
                            </span>
                          </a>
                          <a
                            href="mailto:info@erkab.org"
                            className="text-primary text-decoration-none small d-inline-flex align-items-center gap-1"
                          >
                            <span>info@erkab.org</span>
                            <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                              ({isAm ? 'አጠቃላይ ጥያቄዎች' : 'General Information'})
                            </span>
                          </a>
                          <a
                            href="mailto:donations@erkab.org"
                            className="text-primary text-decoration-none small d-inline-flex align-items-center gap-1"
                          >
                            <span>donations@erkab.org</span>
                            <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                              ({isAm ? 'አጋርነት እና ድጋፍ' : 'Partnerships & Giving'})
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Operating Hours */}
                    <div className="d-flex align-items-start gap-3">
                      <div className="p-2 rounded-3 bg-white text-primary border border-info-subtle shadow-xs flex-shrink-0 mt-1">
                        <Clock size={22} />
                      </div>
                      <div>
                        <strong className="d-block text-dark small fw-bold mb-1">{t.contactPage.operatingHours}</strong>
                        <span className="text-muted small d-block" style={{ lineHeight: '1.5' }}>
                          {t.contactPage.hoursValue}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verified Communications Trust Notice */}
                <div className="mt-4 pt-3 border-top border-light-subtle">
                  <div className="p-3 rounded-3 bg-white border border-light-subtle shadow-xs">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <ShieldCheck size={18} className="text-success flex-shrink-0" />
                      <span className="small fw-bold text-dark">{t.contactPage.officialUpdates}</span>
                    </div>
                    <p className="small text-muted mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.45' }}>
                      {t.contactPage.officialUpdatesNotice}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="col-lg-7">
              <div className="form-card p-4 p-md-5 rounded-4 bg-white border border-light-subtle shadow-sm">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Sparkles size={18} className="text-primary" />
                  <h3 className="h5 fw-bold text-dark mb-0">{t.contactPage.formHeading}</h3>
                </div>

                {submittedRef ? (
                  /* Success State with Real Reference Code */
                  <div className="py-3">
                    <FormSuccess
                      title={t.contactPage.successTitle}
                      message={t.contactPage.successMsg}
                    />

                    <div className="p-4 my-4 rounded-3 bg-light border border-info-subtle text-center">
                      <span className="text-muted small d-block mb-1">{t.contactPage.refLabel}</span>
                      <strong className="h4 text-primary fw-bold font-monospace letter-spacing-1 d-block mb-2">
                        {submittedRef}
                      </strong>
                      <span className="text-muted small">
                        {isAm
                          ? 'እባክዎ ይህን መለያ ቁጥር ለቀጣይ ክትትል ደህንነቱ በተጠበቀ ቦታ ይያዙት።'
                          : 'Please retain this reference code for future inquiries and updates.'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="btn-erkab btn-erkab-primary w-100 justify-content-center mt-2"
                    >
                      <RefreshCw size={16} />
                      <span>{t.contactPage.sendAnotherBtn}</span>
                    </button>
                  </div>
                ) : (
                  /* Form Input Fields */
                  <form onSubmit={handleSubmit} noValidate>
                    {error && <FormError message={error} />}

                    {/* Honeypot field for bot suppression (hidden from humans) */}
                    <div style={{ display: 'none' }} aria-hidden="true">
                      <label htmlFor="hp_organization">Organization Verification</label>
                      <input
                        type="text"
                        id="hp_organization"
                        name="hp_organization"
                        tabIndex={-1}
                        autoComplete="off"
                        value={formData.hp_organization || ''}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="row g-3 mb-3">
                      {/* Full Name */}
                      <div className="col-12 col-md-6">
                        <FormField
                          label={t.contactPage.fullName}
                          name="fullName"
                          placeholder={isAm ? 'ለምሳሌ፡ ዳዊት ኃይሌ' : 'e.g. Dawit Haile'}
                          value={formData.fullName}
                          onChange={handleChange}
                          error={fieldErrors.fullName}
                          required
                        />
                      </div>

                      {/* Email Address */}
                      <div className="col-12 col-md-6">
                        <FormField
                          label={t.contactPage.email}
                          name="email"
                          type="email"
                          placeholder="e.g. dawit@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          error={fieldErrors.email}
                          required
                        />
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
                      {/* Phone Number (Optional) */}
                      <div className="col-12 col-md-6">
                        <FormField
                          label={t.contactPage.phone}
                          name="phone"
                          type="tel"
                          placeholder={isAm ? '+251 9X XXX XXXX' : '+251 9X XXX XXXX'}
                          value={formData.phone || ''}
                          onChange={handleChange}
                          error={fieldErrors.phone}
                        />
                      </div>

                      {/* Inquiry Category (Controlled Allowlist) */}
                      <div className="col-12 col-md-6">
                        <div className="form-group mb-3">
                          <label htmlFor="category" className="form-label small fw-semibold text-dark">
                            {t.contactPage.category} <span className="text-danger">*</span>
                          </label>
                          <select
                            id="category"
                            name="category"
                            className={`form-select ${fieldErrors.category ? 'is-invalid' : ''}`}
                            value={formData.category}
                            onChange={handleChange}
                            required
                          >
                            {categories.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                          {fieldErrors.category && (
                            <div className="invalid-feedback">{fieldErrors.category}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="mb-3">
                      <FormField
                        label={t.contactPage.subject}
                        name="subject"
                        placeholder={
                          isAm
                            ? 'ለምሳሌ፡ ስለ ዌብ ዲቨሎፕመንት ስልጠና የሚቀርብ ጥያቄ'
                            : 'e.g. Question regarding upcoming Full-Stack Web Development cohort'
                        }
                        value={formData.subject}
                        onChange={handleChange}
                        error={fieldErrors.subject}
                        required
                      />
                    </div>

                    {/* Message Body */}
                    <div className="mb-4">
                      <FormField
                        label={t.contactPage.message}
                        name="message"
                        isTextArea
                        rows={6}
                        placeholder={
                          isAm
                            ? 'የአስተዳደር እና የስልጠና ቡድናችን በምን ሊረዳዎ ይችላል? ዝርዝር ሀሳብዎን እዚህ ይጻፉ...'
                            : 'How can our admissions and training leads help you? Please describe your question or inquiry in detail...'
                        }
                        value={formData.message}
                        onChange={handleChange}
                        error={fieldErrors.message}
                        required
                      />
                    </div>

                    {/* Submit Action */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-erkab btn-erkab-lime w-100 justify-content-center py-2 fw-bold shadow-xs"
                      style={{ minHeight: '48px' }}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="spinner-border spinner-border-sm me-2" />
                          <span>{t.contactPage.sendingMessage}</span>
                        </>
                      ) : (
                        <>
                          <Send size={18} className="me-2" />
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
