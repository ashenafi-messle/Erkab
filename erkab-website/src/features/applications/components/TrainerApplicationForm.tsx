'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/forms/FormField';
import { FileUploadField } from '@/components/forms/FileUploadField';
import { FormProgress } from '@/components/forms/FormProgress';
import { ApplicationSummary } from '@/components/forms/ApplicationSummary';
import { FormError } from '@/components/forms/FormError';
import { PROGRAMS, Program, getLocalizedProgram } from '@/lib/constants/programs';
import { getPrograms } from '@/features/programs/service';
import { TrainerApplicationFormData } from '../types';
import { submitTrainerApplication } from '../service';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ArrowLeft, ArrowRight, Send, Loader2 } from 'lucide-react';

export function TrainerApplicationForm() {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const isAm = locale === 'am';

  const STEPS = [
    t.applyTrainer.step1,
    t.applyTrainer.step2,
    t.applyTrainer.step3,
    t.applyTrainer.step4,
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [programsList, setProgramsList] = useState<Program[]>(PROGRAMS);

  useEffect(() => {
    let isMounted = true;
    getPrograms().then((data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        setProgramsList(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const [formData, setFormData] = useState<TrainerApplicationFormData>({
    fullName: '',
    email: '',
    telegramPhone: '',
    expertiseTrack: '',
    yearsOfExperience: '',
    portfolioUrl: '',
    resumeFile: null,
    teachingStatement: '',
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

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, resumeFile: file }));
    if (validationErrors.resumeFile) {
      setValidationErrors((prev) => ({ ...prev, resumeFile: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) {
        errors.fullName = isAm ? 'ሙሉ ስም ማስገባት ግዴታ ነው።' : 'Full Name is required.';
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        errors.email = isAm ? 'ትክክለኛ ኢሜይል ማስገባት ግዴታ ነው።' : 'Valid email is required.';
      }
      if (!formData.telegramPhone.trim()) {
        errors.telegramPhone = isAm ? 'የቴሌግራም ስልክ ቁጥር ማስገባት ግዴታ ነው።' : 'Telegram phone number is required.';
      }
      if (!formData.expertiseTrack) {
        errors.expertiseTrack = isAm ? 'የስልጠና መስክ መምረጥ ግዴታ ነው።' : 'Please select your track of expertise.';
      }
    } else if (step === 2) {
      if (!formData.yearsOfExperience) {
        errors.yearsOfExperience = isAm ? 'የስራ ልምድ ዓመታትን መምረጥ ግዴታ ነው።' : 'Years of experience is required.';
      }
      if (!formData.teachingStatement.trim()) {
        errors.teachingStatement = isAm ? 'የማስተማር ተነሳሽነት መግለጫ መጻፍ ግዴታ ነው።' : 'Please provide a brief teaching motivation statement.';
      }
    } else if (step === 3) {
      if (!formData.resumeFile) {
        errors.resumeFile = isAm ? 'የCV / Resume ሰነድ (PDF) ማያያዝ ግዴታ ነው።' : 'CV / Resume PDF document is required.';
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
      const result = await submitTrainerApplication(formData);
      if (result.success) {
        router.push(`/apply/success?ref=${result.referenceNumber || 'ERKAB-TRN-2026'}`);
      } else {
        setErrorMessage(
          result.message || (isAm ? 'ማመልከቻውን መላክ አልተቻለም።' : 'Submission could not be completed.')
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Trainer application submission failed';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-card mx-auto" style={{ maxWidth: '780px' }}>
      {/* Official Faculty & Mentor Recruitment Header with Logo */}
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
            <h2 className="h6 fw-bold text-dark mb-0">{t.applyTrainer.portalTitle}</h2>
            <span className="small text-muted">{t.brand.name}</span>
          </div>
        </div>
        <span className="badge badge-blue small d-none d-sm-inline-block">
          {isAm ? 'የአሰልጣኞች መግቢያ' : 'Faculty Portal'}
        </span>
      </div>

      <FormProgress steps={STEPS} currentStep={currentStep} />

      <FormError message={errorMessage} />

      <form onSubmit={handleSubmit} noValidate>
        {/* Step 1: Personal Profile */}
        {currentStep === 1 && (
          <div>
            <h3 className="h5 fw-bold mb-4 text-start">{t.applyTrainer.step1Heading}</h3>

            <FormField
              label={t.applyTrainer.fullName}
              name="fullName"
              placeholder={isAm ? 'ለምሳሌ፡ ዶ/ር ዮሐንስ ታደሰ' : 'e.g. Dr. Yohannes Tadesse'}
              value={formData.fullName}
              onChange={handleTextChange}
              required
              error={validationErrors.fullName}
            />

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <FormField
                  label={t.applyTrainer.email}
                  name="email"
                  type="email"
                  placeholder="e.g. yohannes@example.com"
                  value={formData.email}
                  onChange={handleTextChange}
                  required
                  error={validationErrors.email}
                />
              </div>

              <div className="col-12 col-md-6">
                <FormField
                  label={t.applyTrainer.phone}
                  name="telegramPhone"
                  type="tel"
                  placeholder="e.g. +251 91 123 4567"
                  value={formData.telegramPhone}
                  onChange={handleTextChange}
                  required
                  error={validationErrors.telegramPhone}
                />
              </div>
            </div>

            <FormField
              label={t.applyTrainer.specialtyTrack}
              name="expertiseTrack"
              value={formData.expertiseTrack}
              onChange={handleTextChange}
              required
              options={programsList.map((p) => {
                const locP = getLocalizedProgram(p, locale);
                return { value: locP.title, label: locP.title };
              })}
              error={validationErrors.expertiseTrack}
            />
          </div>
        )}

        {/* Step 2: Experience & Links */}
        {currentStep === 2 && (
          <div>
            <h3 className="h5 fw-bold mb-4 text-start">{t.applyTrainer.step2Heading}</h3>

            <FormField
              label={t.applyTrainer.yearsExperience}
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleTextChange}
              required
              options={[
                { value: '1-2 years', label: isAm ? '1 - 2 ዓመታት' : '1 - 2 years' },
                { value: '3-5 years', label: isAm ? '3 - 5 ዓመታት' : '3 - 5 years' },
                { value: '5-8 years', label: isAm ? '5 - 8 ዓመታት' : '5 - 8 years' },
                { value: '8+ years', label: isAm ? '8+ ዓመታት' : '8+ years' },
              ]}
              error={validationErrors.yearsOfExperience}
            />

            <FormField
              label={t.applyTrainer.portfolioLinkedinUrl}
              name="portfolioUrl"
              type="url"
              placeholder="https://linkedin.com/in/... or https://github.com/..."
              value={formData.portfolioUrl}
              onChange={handleTextChange}
              helpText={
                isAm
                  ? 'የስራዎችዎን ማሳያ፣ የኮድ ማከማቻ (GitHub) ወይም ፕሮፌሽናል ሊንክ ያያይዙ (አማራጭ)።'
                  : 'Optional link to your work, code repositories, or professional profile.'
              }
            />

            <FormField
              label={isAm ? 'የማስተማር ተነሳሽነት መግለጫ' : 'Teaching Statement / Motivation'}
              name="teachingStatement"
              isTextArea
              rows={4}
              placeholder={
                isAm
                  ? 'በጎንደር ወጣቶችን ለምን ማሰልጠን እንደሚፈልጉ እና ተግባራዊ የማስተማር ፍልስፍናዎን ያብራሩ...'
                  : 'Share why you wish to mentor young talents in Gondar and your practical teaching philosophy...'
              }
              value={formData.teachingStatement}
              onChange={handleTextChange}
              required
              error={validationErrors.teachingStatement}
            />
          </div>
        )}

        {/* Step 3: CV Upload */}
        {currentStep === 3 && (
          <div>
            <h3 className="h5 fw-bold mb-2 text-start">{t.applyTrainer.step3Heading}</h3>
            <p className="text-muted small text-start mb-4">
              {t.applyTrainer.cvHint}
            </p>

            <FileUploadField
              label={t.applyTrainer.cvDocument}
              name="resumeFile"
              accept=".pdf"
              file={formData.resumeFile}
              onFileSelect={handleFileChange}
              required
              error={validationErrors.resumeFile}
              description={
                isAm ? 'የተዘጋጀውን የCV ሰነድ በPDF ፎርማት ያያይዙ።' : 'Upload your updated CV in PDF format.'
              }
            />
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div>
            <h3 className="h5 fw-bold mb-3 text-start">{t.applyTrainer.step4Heading}</h3>
            <ApplicationSummary type="trainer" data={formData} />
            <div className="form-check text-start mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="trainerTruthConfirm"
                required
                defaultChecked
              />
              <label className="form-check-label small text-muted" htmlFor="trainerTruthConfirm">
                {t.applyTrainer.confirmDeclaration}
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
              <span>{t.applyTrainer.prevStep}</span>
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
              <span>{t.applyTrainer.nextStep}</span>
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
                  <span>{t.applyTrainer.submittingApplication}</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>{t.applyTrainer.submitApplication}</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
