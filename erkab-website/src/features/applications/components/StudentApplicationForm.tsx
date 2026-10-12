'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/forms/FormField';
import { FileUploadField } from '@/components/forms/FileUploadField';
import { FormProgress } from '@/components/forms/FormProgress';
import { ApplicationSummary } from '@/components/forms/ApplicationSummary';
import { FormError } from '@/components/forms/FormError';
import { PROGRAMS, getLocalizedProgram } from '@/lib/constants/programs';
import { StudentApplicationFormData } from '../types';
import { submitStudentApplication } from '../service';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ArrowLeft, ArrowRight, Send, Loader2 } from 'lucide-react';

interface StudentApplicationFormProps {
  defaultProgramId?: string;
}

export function StudentApplicationForm({ defaultProgramId }: StudentApplicationFormProps) {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const isAm = locale === 'am';

  const STEPS = [
    t.applyStudent.step1,
    t.applyStudent.step2,
    t.applyStudent.step3,
    t.applyStudent.step4,
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<StudentApplicationFormData>({
    fullName: '',
    gender: '',
    age: '',
    classCompletionYear: '',
    telegramPhone: '',
    email: '',
    selectedProgramId: defaultProgramId || '',
    educationCertificate: null,
    nationalId: null,
    ideaProposal: null,
  });

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (field: keyof StudentApplicationFormData, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) {
        errors.fullName = isAm ? 'ሙሉ ስም ማስገባት ግዴታ ነው።' : 'Full Name is required.';
      }
      if (!formData.gender) {
        errors.gender = isAm ? 'ጾታ መምረጥ ግዴታ ነው።' : 'Gender is required.';
      }
      if (!formData.age || Number(formData.age) < 16) {
        errors.age = isAm ? 'ትክክለኛ ዕድሜ (16+) ማስገባት ግዴታ ነው።' : 'Valid age (16+) is required.';
      }
      if (!formData.classCompletionYear.trim()) {
        errors.classCompletionYear = isAm ? 'የምረቃ ዓመት ማስገባት ግዴታ ነው።' : 'Completion year is required.';
      }
      if (!formData.selectedProgramId) {
        errors.selectedProgramId = isAm ? 'እባክዎ የስልጠና መስክ ይምረጡ።' : 'Please select a training track.';
      }
    } else if (step === 2) {
      if (!formData.telegramPhone.trim()) {
        errors.telegramPhone = isAm
          ? 'ለይፋዊ መረጃ ግንኙነት የቴሌግራም ስልክ ቁጥር ማስገባት ግዴታ ነው።'
          : 'Telegram phone number is required for official communication.';
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        errors.email = isAm ? 'ትክክለኛ የኢሜይል አድራሻ ማስገባት ግዴታ ነው።' : 'Valid email address is required.';
      }
    } else if (step === 3) {
      if (!formData.educationCertificate) {
        errors.educationCertificate = isAm
          ? 'የትምህርት ማስረጃ ሰነድ ማያያዝ ግዴታ ነው።'
          : 'Education certificate / degree document is required.';
      }
      if (!formData.nationalId) {
        errors.nationalId = isAm
          ? 'የማንነት መታወቂያ ሰነድ ማያያዝ ግዴታ ነው።'
          : 'National ID document is required.';
      }
      if (!formData.ideaProposal) {
        errors.ideaProposal = isAm
          ? 'የፈጠራ ሃሳብ ፕሮፖዛል ማያያዝ ግዴታ ነው።'
          : 'One-page innovative idea proposal is required.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep(2)) {
      setCurrentStep(2);
      return;
    }
    if (!validateStep(3)) {
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const result = await submitStudentApplication(formData);
      if (result.success) {
        router.push(`/apply/success?ref=${result.referenceNumber || 'ERKAB-APP-2026'}`);
      } else {
        setErrorMessage(
          result.message || (isAm ? 'ማመልከቻውን መላክ አልተቻለም።' : 'Submission could not be completed.')
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Application submission failed';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProgram = PROGRAMS.find((p) => p.id === formData.selectedProgramId);
  const localizedProgram = selectedProgram ? getLocalizedProgram(selectedProgram, locale) : null;

  return (
    <div className="form-card mx-auto" style={{ maxWidth: '780px' }}>
      {/* Official Admissions Header with Logo */}
      <div className="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom border-light-subtle">
        <div className="d-flex align-items-center gap-3">
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
            <h2 className="h6 fw-bold text-dark mb-0">{t.applyStudent.portalTitle}</h2>
            <span className="small text-muted">{t.brand.name}</span>
          </div>
        </div>
        <span className="badge badge-lime small d-none d-sm-inline-block">{t.common.scholarshipTrack}</span>
      </div>

      <FormProgress steps={STEPS} currentStep={currentStep} />

      <FormError message={errorMessage} />

      <form onSubmit={handleSubmit} noValidate>
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div>
            <h3 className="h5 fw-bold mb-4 text-start">{t.applyStudent.step1Heading}</h3>

            <FormField
              label={t.applyStudent.fullName}
              name="fullName"
              placeholder={isAm ? 'ለምሳሌ፡ አልማዝ በቀለ' : 'e.g. Almaz Bekele'}
              value={formData.fullName}
              onChange={handleTextChange}
              required
              error={validationErrors.fullName}
            />

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <FormField
                  label={t.applyStudent.gender}
                  name="gender"
                  value={formData.gender}
                  onChange={handleTextChange}
                  required
                  options={[
                    { value: 'Female', label: t.applyStudent.female },
                    { value: 'Male', label: t.applyStudent.male },
                    { value: 'Prefer not to say', label: t.applyStudent.preferNotToSay },
                  ]}
                  error={validationErrors.gender}
                />
              </div>

              <div className="col-12 col-md-6">
                <FormField
                  label={t.applyStudent.age}
                  name="age"
                  type="number"
                  placeholder="e.g. 21"
                  value={formData.age}
                  onChange={handleTextChange}
                  required
                  error={validationErrors.age}
                />
              </div>
            </div>

            <FormField
              label={isAm ? 'የትምህርት ምረቃ ዓመት (12ኛ ክፍል ወይም ዩኒቨርሲቲ)' : 'Class Completion Year (High School or University)'}
              name="classCompletionYear"
              placeholder="e.g. 2024 / 2025"
              value={formData.classCompletionYear}
              onChange={handleTextChange}
              required
              error={validationErrors.classCompletionYear}
            />

            <FormField
              label={t.applyStudent.trackSelection}
              name="selectedProgramId"
              value={formData.selectedProgramId}
              onChange={handleTextChange}
              required
              options={PROGRAMS.map((p) => {
                const locP = getLocalizedProgram(p, locale);
                return { value: p.id, label: `${locP.title} (${locP.duration})` };
              })}
              error={validationErrors.selectedProgramId}
              helpText={
                isAm
                  ? 'በነጻ ስኮላርሺፕ ስልጠና ለመሳተፍ ከ10ሩ የስልጠና መስኮች አንዱን ይምረጡ።'
                  : 'Select one of the 10 training tracks you want to apply for under scholarship.'
              }
            />
          </div>
        )}

        {/* Step 2: Contact Info */}
        {currentStep === 2 && (
          <div>
            <h3 className="h5 fw-bold mb-4 text-start">{t.applyStudent.step2Heading}</h3>

            <FormField
              label={t.applyStudent.telegramPhone}
              name="telegramPhone"
              type="tel"
              placeholder="e.g. +251 91 234 5678"
              value={formData.telegramPhone}
              onChange={handleTextChange}
              required
              error={validationErrors.telegramPhone}
              helpText={t.applyStudent.telegramHint}
            />

            <FormField
              label={t.applyStudent.email}
              name="email"
              type="email"
              placeholder="e.g. applicant@example.com"
              value={formData.email}
              onChange={handleTextChange}
              required
              error={validationErrors.email}
            />
          </div>
        )}

        {/* Step 3: Document Uploads */}
        {currentStep === 3 && (
          <div>
            <h3 className="h5 fw-bold mb-2 text-start">{t.applyStudent.step3Heading}</h3>
            <p className="text-muted small text-start mb-4">
              {isAm
                ? 'እባክዎ ግልጽ ሰነዶችን ያያይዙ። የተፈቀዱ ፋይሎች፡ PDF ወይም ፎቶ (PNG/JPG)፣ እስከ 10MB እያንዳንዳቸው።'
                : 'Please upload clear copies. Allowed formats: PDF or images (PNG/JPG) up to 10MB each.'}
            </p>

            <FileUploadField
              label={t.applyStudent.docCert}
              name="educationCertificate"
              accept=".pdf,.png,.jpg,.jpeg"
              file={formData.educationCertificate}
              onFileSelect={(f) => handleFileChange('educationCertificate', f)}
              required
              error={validationErrors.educationCertificate}
              description={t.applyStudent.docCertHint}
            />

            <FileUploadField
              label={t.applyStudent.docId}
              name="nationalId"
              accept=".pdf,.png,.jpg,.jpeg"
              file={formData.nationalId}
              onFileSelect={(f) => handleFileChange('nationalId', f)}
              required
              error={validationErrors.nationalId}
              description={t.applyStudent.docIdHint}
            />

            <FileUploadField
              label={t.applyStudent.docProposal}
              name="ideaProposal"
              accept=".pdf,.docx"
              file={formData.ideaProposal}
              onFileSelect={(f) => handleFileChange('ideaProposal', f)}
              required
              error={validationErrors.ideaProposal}
              description={t.applyStudent.docProposalHint}
            />
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div>
            <h3 className="h5 fw-bold mb-3 text-start">{t.applyStudent.step4Heading}</h3>
            <ApplicationSummary
              type="student"
              data={formData}
              programTitle={localizedProgram ? localizedProgram.title : ''}
            />
            <div className="form-check text-start mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="truthConfirm"
                required
                defaultChecked
              />
              <label className="form-check-label small text-muted" htmlFor="truthConfirm">
                {t.applyStudent.confirmDeclaration}
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
            >
              <ArrowLeft size={16} />
              <span>{t.applyStudent.prevStep}</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-erkab btn-erkab-primary d-inline-flex align-items-center gap-2"
            >
              <span>{t.applyStudent.nextStep}</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-erkab btn-erkab-lime d-inline-flex align-items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spinner-border spinner-border-sm" />
                  <span>{t.applyStudent.submittingApplication}</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>{t.applyStudent.submitApplication}</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
