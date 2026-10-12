'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/forms/FormField';
import { FileUploadField } from '@/components/forms/FileUploadField';
import { FormProgress } from '@/components/forms/FormProgress';
import { ApplicationSummary } from '@/components/forms/ApplicationSummary';
import { FormError } from '@/components/forms/FormError';
import { TutorApplicationFormData } from '../types';
import { submitTutorApplication } from '../service';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ArrowLeft, ArrowRight, Send, Loader2 } from 'lucide-react';

export function TutorApplicationForm() {
  const router = useRouter();
  const { locale } = useLanguage();
  const isAm = locale === 'am';

  const STEPS = [
    isAm ? 'መሰረታዊ መረጃ' : 'Personal Details',
    isAm ? 'የትምህርት መስክና ልምድ' : 'Expertise & Grade Levels',
    isAm ? 'የCV ሰነድ ማያያዣ' : 'CV / Resume (Optional)',
    isAm ? 'ማጠቃለያ እና ማረጋገጫ' : 'Review & Submit',
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<TutorApplicationFormData>({
    fullName: '',
    email: '',
    phone: '',
    subjects: '',
    gradeLevel: 'High School',
    deliveryPreference: 'In-Person / Home',
    locationDetails: '',
    qualifications: '',
    experience: '',
    hourlyRate: '',
    resumeFile: null,
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
      if (!formData.phone.trim()) {
        errors.phone = isAm ? 'የስልክ ቁጥር ማስገባት ግዴታ ነው።' : 'Phone number is required.';
      }
      if (!formData.deliveryPreference) {
        errors.deliveryPreference = isAm ? 'የአሰጣጥ ምርጫ መምረጥ ግዴታ ነው።' : 'Delivery preference is required.';
      }
    } else if (step === 2) {
      if (!formData.subjects.trim()) {
        errors.subjects = isAm ? 'የሚያስተምሯቸውን የትምህርት አይነቶች ያስገቡ።' : 'Subjects are required.';
      }
      if (!formData.gradeLevel) {
        errors.gradeLevel = isAm ? 'የክፍል ደረጃ መምረጥ ግዴታ ነው።' : 'Grade level is required.';
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
    if (!validateStep(1) || !validateStep(2)) {
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const result = await submitTutorApplication(formData);
      if (result.success) {
        router.push(`/apply/success?ref=${result.referenceNumber || 'ERKAB-TUT-2026'}`);
      } else {
        setErrorMessage(
          result.message || (isAm ? 'ማመልከቻውን መላክ አልተቻለም።' : 'Submission could not be completed.')
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Tutor application submission failed';
      setErrorMessage(
        isAm
          ? `${message}። ሰርቨሩ በጊዜያዊነት የማይሰራ ከሆነ እባክዎ በ info@erkab.org ያግኙን።`
          : message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-card mx-auto" style={{ maxWidth: '780px' }}>
      {/* Official Header */}
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
            <h2 className="h6 fw-bold text-dark mb-0">
              {isAm ? 'የአካዳሚክ መካሪና ሞግዚት ምዝገባ ፖርታል' : 'Academic Tutor & Mentor Registration'}
            </h2>
            <span className="small text-muted">
              {isAm ? 'እርካብ የክህሎት ማሰልጠኛ ድርጅት' : 'Erkab Skills Training Organization'}
            </span>
          </div>
        </div>
        <span className="badge badge-cyan small d-none d-sm-inline-block">
          {isAm ? 'የሞግዚቶች ፖርታል' : 'Tutor Network'}
        </span>
      </div>

      <FormProgress steps={STEPS} currentStep={currentStep} />
      <FormError message={errorMessage} />

      <form onSubmit={handleSubmit} noValidate>
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div>
            <h3 className="h5 fw-bold mb-4 text-start">
              {isAm ? 'ደረጃ 1፡ የግል እና የመገናኛ መረጃ' : 'Step 1: Contact Information'}
            </h3>

            <FormField
              label={isAm ? 'ሙሉ ስም' : 'Full Name'}
              name="fullName"
              placeholder={isAm ? 'ለምሳሌ፡ አበበ ከበደ' : 'e.g. Abebe Kebede'}
              value={formData.fullName}
              onChange={handleTextChange}
              required
              error={validationErrors.fullName}
            />

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <FormField
                  label={isAm ? 'የስልክ ቁጥር' : 'Contact Phone / Telegram'}
                  name="phone"
                  type="tel"
                  placeholder="e.g. +251 91 123 4567"
                  value={formData.phone}
                  onChange={handleTextChange}
                  required
                  error={validationErrors.phone}
                />
              </div>

              <div className="col-12 col-md-6">
                <FormField
                  label={isAm ? 'ኢሜይል አድራሻ (አማራጭ)' : 'Email Address (Optional)'}
                  name="email"
                  type="email"
                  placeholder="e.g. tutor@example.com"
                  value={formData.email || ''}
                  onChange={handleTextChange}
                />
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <FormField
                  label={isAm ? 'የማስተማሪያ ምርጫ' : 'Delivery Preference'}
                  name="deliveryPreference"
                  value={formData.deliveryPreference}
                  onChange={handleTextChange}
                  required
                  options={[
                    { value: 'In-Person / Home', label: isAm ? 'በአካል / በቤት' : 'In-Person / Home' },
                    { value: 'Online', label: isAm ? 'ኦንላይን' : 'Online' },
                    { value: 'Both / Flexible', label: isAm ? 'ሁለቱም / እንደ አመቺነቱ' : 'Both / Flexible' },
                  ]}
                  error={validationErrors.deliveryPreference}
                />
              </div>

              <div className="col-12 col-md-6">
                <FormField
                  label={isAm ? 'አካባቢ / ሰፈር (ጎንደር)' : 'Neighborhood / Location in Gondar'}
                  name="locationDetails"
                  placeholder="e.g. Maraki, Piazza, Arada..."
                  value={formData.locationDetails || ''}
                  onChange={handleTextChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Expertise & Grade Levels */}
        {currentStep === 2 && (
          <div>
            <h3 className="h5 fw-bold mb-4 text-start">
              {isAm ? 'ደረጃ 2፡ የትምህርት አይነቶችና የክፍል ደረጃዎች' : 'Step 2: Subjects & Qualifications'}
            </h3>

            <FormField
              label={isAm ? 'የሚያስተምሯቸው የትምህርት አይነቶች' : 'Subjects Taught'}
              name="subjects"
              placeholder="e.g. Mathematics, Physics, English, Chemistry, ICT..."
              value={formData.subjects}
              onChange={handleTextChange}
              required
              error={validationErrors.subjects}
              helpText={isAm ? 'በርካታ ትምህርቶችን በነጠላ ሰረዝ (ኮማ) ይለዩ።' : 'Separate multiple subjects with commas.'}
            />

            <FormField
              label={isAm ? 'የማስተማሪያ የክፍል ደረጃ' : 'Education Levels Taught'}
              name="gradeLevel"
              value={formData.gradeLevel}
              onChange={handleTextChange}
              required
              options={[
                { value: 'Elementary (1-8)', label: isAm ? 'የመጀመሪያ ደረጃ (1-8)' : 'Elementary (Grades 1-8)' },
                { value: 'High School (9-12)', label: isAm ? 'የሁለተኛ ደረጃ (9-12)' : 'High School (Grades 9-12)' },
                { value: 'University / Preparatory', label: isAm ? 'የዩኒቨርሲቲ / የዝግጅት ክፍል' : 'University / College Preparatory' },
                { value: 'All Levels', label: isAm ? 'ሁሉንም ደረጃዎች' : 'All Levels' },
              ]}
              error={validationErrors.gradeLevel}
            />

            <FormField
              label={isAm ? 'የትምህርት ዝግጅት እና የሙያ ማስረጃ' : 'Qualifications & Academic Background'}
              name="qualifications"
              placeholder={isAm ? 'ለምሳሌ፡ BSc in Mathematics, University of Gondar' : 'e.g. BSc in Computer Science / Mathematics'}
              value={formData.qualifications || ''}
              onChange={handleTextChange}
            />

            <FormField
              label={isAm ? 'የማስተማር ልምድ' : 'Teaching / Tutoring Experience'}
              name="experience"
              isTextArea
              rows={3}
              placeholder={isAm ? 'ያለዎትን የማስተማር እና የተማሪዎችን የማብቃት ልምድ ያብራሩ...' : 'Describe your relevant tutoring or teaching experience...'}
              value={formData.experience || ''}
              onChange={handleTextChange}
            />
          </div>
        )}

        {/* Step 3: CV Upload */}
        {currentStep === 3 && (
          <div>
            <h3 className="h5 fw-bold mb-2 text-start">
              {isAm ? 'ደረጃ 3፡ የCV / ማስረጃ ሰነድ (አማራጭ)' : 'Step 3: CV / Resume (Optional)'}
            </h3>
            <p className="text-muted small text-start mb-4">
              {isAm
                ? 'ያለዎትን የትምህርት እና የስራ ልምድ ዝርዝር የያዘ CV (PDF) ካለዎት ያያይዙ።'
                : 'Upload an optional CV or resume in PDF format to strengthen your profile.'}
            </p>

            <FileUploadField
              label={isAm ? 'የCV ሰነድ (PDF)' : 'CV Document (PDF)'}
              name="resumeFile"
              accept=".pdf"
              file={formData.resumeFile || null}
              onFileSelect={handleFileChange}
              description={isAm ? 'ከ5MB ያልበለጠ የPDF ሰነድ ያያይዙ።' : 'Upload a PDF up to 5MB.'}
            />
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div>
            <h3 className="h5 fw-bold mb-3 text-start">
              {isAm ? 'ደረጃ 4፡ ማጠቃለያ እና ማረጋገጫ' : 'Step 4: Review Application'}
            </h3>
            <ApplicationSummary type="tutor" data={formData} />
            <div className="form-check text-start mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="tutorTruthConfirm"
                required
                defaultChecked
              />
              <label className="form-check-label small text-muted" htmlFor="tutorTruthConfirm">
                {isAm
                  ? 'ያስገባሁት መረጃ በሙሉ ትክክለኛና እውነተኛ መሆኑን አረጋግጣለሁ።'
                  : 'I confirm that all details provided are true and accurate.'}
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
              <span>{isAm ? 'ወደ ኋላ' : 'Previous'}</span>
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
              <span>{isAm ? 'ቀጣይ' : 'Next'}</span>
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
                  <span>{isAm ? 'በመላክ ላይ...' : 'Submitting...'}</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>{isAm ? 'ማመልከቻውን ላክ' : 'Submit Application'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
