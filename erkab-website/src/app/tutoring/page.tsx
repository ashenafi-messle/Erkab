'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/ui/PageHero';
import { FormField } from '@/components/forms/FormField';
import { FormError } from '@/components/forms/FormError';
import { submitTutoringRequest, SCHOOL_GRADES, SchoolGrade } from '@/features/tutoring/service';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  Laptop,
  Home,
  CheckCircle2,
  Send,
  Loader2,
  GraduationCap,
  School,
  ArrowRight,
} from 'lucide-react';

const GRADE_KEYS: { value: SchoolGrade; key: keyof typeof import('@/lib/i18n/messages').messages.en.tutoringPage.grades }[] = [
  { value: 'Grade 1', key: 'grade1' },
  { value: 'Grade 2', key: 'grade2' },
  { value: 'Grade 3', key: 'grade3' },
  { value: 'Grade 4', key: 'grade4' },
  { value: 'Grade 5', key: 'grade5' },
  { value: 'Grade 6', key: 'grade6' },
  { value: 'Grade 7', key: 'grade7' },
  { value: 'Grade 8', key: 'grade8' },
  { value: 'Grade 9', key: 'grade9' },
  { value: 'Grade 10', key: 'grade10' },
  { value: 'Grade 11', key: 'grade11' },
  { value: 'Grade 12', key: 'grade12' },
];

export default function TutoringPage() {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const isAm = locale === 'am';

  const [studentName, setStudentName] = useState('');
  const [educationLevel, setEducationLevel] = useState<'School' | 'University'>('School');
  const [schoolGrade, setSchoolGrade] = useState<SchoolGrade | ''>('Grade 9');
  const [universityInfo, setUniversityInfo] = useState('');
  const [subjects, setSubjects] = useState('');
  const [deliveryPreference, setDeliveryPreference] = useState<'Online' | 'In-Person / Home'>('In-Person / Home');
  const [parentOrContactPhone, setParentOrContactPhone] = useState('');
  const [email, setEmail] = useState('');
  const [locationDetails, setLocationDetails] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim() || !parentOrContactPhone.trim() || !subjects.trim()) {
      setError(
        isAm
          ? 'እባክዎ የተማሪውን ሙሉ ስም፣ የስልክ ቁጥር እና የሚፈለጉትን የትምህርት አይነቶች ያስገቡ።'
          : 'Please provide the student full name, contact phone number, and focus subjects.'
      );
      return;
    }

    if (educationLevel === 'School') {
      if (!schoolGrade || !SCHOOL_GRADES.includes(schoolGrade as SchoolGrade)) {
        setError(
          isAm
            ? 'እባክዎ ከ1ኛ እስከ 12ኛ ክፍል ውስጥ ትክክለኛ ክፍል ይምረጡ።'
            : 'Please select a valid school grade (Grade 1 through Grade 12).'
        );
        return;
      }
    } else {
      if (!universityInfo.trim()) {
        setError(
          isAm
            ? 'እባክዎ የዩኒቨርሲቲ የትምህርት ዘርፍዎን ወይም ዓመትዎን ያስገቡ።'
            : 'Please enter your university academic field or standing year.'
        );
        return;
      }
    }

    setLoading(true);
    setError('');

    const finalGradeLevel = educationLevel === 'School' ? schoolGrade : universityInfo.trim();

    try {
      const res = await submitTutoringRequest({
        studentName: studentName.trim(),
        educationLevel,
        gradeLevel: finalGradeLevel,
        subjects: subjects
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        deliveryPreference,
        parentOrContactPhone: parentOrContactPhone.trim(),
        email: email.trim() || undefined,
        locationDetails: locationDetails.trim() || undefined,
      });

      if (res.paymentUrl) {
        router.push(res.paymentUrl);
      } else if (res.paymentReference) {
        router.push(`/tutoring/payment/${res.paymentReference}`);
      } else {
        router.push(`/tutoring/payment/success?ref=${res.referenceNumber}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      setError(
        isAm
          ? `${message}። ሰርቨሩ በጊዜያዊነት የማይሰራ ከሆነ እባክዎ በቀጥታ በ info@erkab.org ያግኙን።`
          : `${message}. If the backend server is offline, please contact admissions directly at info@erkab.org.`
      );
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        badge={t.tutoringPage.heroBadge}
        title={t.tutoringPage.heroTitle}
        description={t.tutoringPage.heroDesc}
      />

      <section className="section-py section-bg-white pt-0">
        <Container>
          <div className="row g-5 align-items-stretch mb-5">
            <div className="col-lg-6">
              <div className="p-0 rounded-4 bg-light border border-light-subtle h-100 overflow-hidden d-flex flex-column">
                <div className="position-relative w-100" style={{ aspectRatio: '16 / 9', backgroundColor: '#071927' }}>
                  <Image
                    src="/images/tutoring/online-tutoring.jpg"
                    alt="Online interactive tutoring for Ethiopian students"
                    fill
                    sizes="(max-width: 991px) 100vw, 550px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="p-4 flex-grow-1">
                  <div className="d-flex align-items-center gap-2 text-primary fw-bold mb-3">
                    <Laptop size={24} />
                    <h2 className="h5 fw-bold text-dark mb-0">{t.tutoringPage.onlineTitle}</h2>
                  </div>
                  <p className="text-muted small" style={{ lineHeight: '1.6' }}>
                    {t.tutoringPage.onlineDesc}
                  </p>
                  <ul className="list-unstyled small text-muted d-flex flex-column gap-2 mb-0">
                    <li className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={16} className="text-success" />
                      <span>{t.tutoringPage.onlineFeature1}</span>
                    </li>
                    <li className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={16} className="text-success" />
                      <span>{t.tutoringPage.onlineFeature2}</span>
                    </li>
                    <li className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={16} className="text-success" />
                      <span>{t.tutoringPage.onlineFeature3}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="p-0 rounded-4 bg-light border border-light-subtle h-100 overflow-hidden d-flex flex-column">
                <div className="position-relative w-100" style={{ aspectRatio: '16 / 9', backgroundColor: '#071927' }}>
                  <Image
                    src="/images/tutoring/in-person-tutoring.jpg"
                    alt="In-person tutoring and academic mentoring in Gondar"
                    fill
                    sizes="(max-width: 991px) 100vw, 550px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="p-4 flex-grow-1">
                  <div className="d-flex align-items-center gap-2 text-primary fw-bold mb-3">
                    <Home size={24} />
                    <h2 className="h5 fw-bold text-dark mb-0">{t.tutoringPage.inPersonTitle}</h2>
                  </div>
                  <p className="text-muted small" style={{ lineHeight: '1.6' }}>
                    {t.tutoringPage.inPersonDesc}
                  </p>
                  <ul className="list-unstyled small text-muted d-flex flex-column gap-2 mb-0">
                    <li className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={16} className="text-success" />
                      <span>{t.tutoringPage.inPersonFeature1}</span>
                    </li>
                    <li className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={16} className="text-success" />
                      <span>{t.tutoringPage.inPersonFeature2}</span>
                    </li>
                    <li className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={16} className="text-success" />
                      <span>{t.tutoringPage.inPersonFeature3}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Tutoring Registration Form */}
          <div className="mx-auto" style={{ maxWidth: '680px' }}>
            <div className="form-card shadow-sm border p-4 p-md-5 rounded-4 bg-white">
              <div className="d-flex align-items-center gap-2 mb-2">
                <GraduationCap className="text-primary" size={24} />
                <h3 className="h5 fw-bold text-dark mb-0">{t.tutoringPage.formTitle}</h3>
              </div>
              <p className="text-muted small text-start mb-4">
                {t.tutoringPage.formDesc}
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <FormError message={error} />

                {/* Student Full Name */}
                <FormField
                  label={t.tutoringPage.studentName}
                  name="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder={isAm ? 'ለምሳሌ፡ ዮናስ አለሙ' : 'e.g. Yonas Alemu'}
                  required
                />

                {/* Education Level Selector */}
                <div className="mb-3 text-start">
                  <label className="form-label fw-bold small text-dark mb-2">
                    {t.tutoringPage.educationLevelLabel} <span className="text-danger">*</span>
                  </label>
                  <div className="row g-2">
                    <div className="col-6">
                      <button
                        type="button"
                        className={`btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 border text-start ${
                          educationLevel === 'School'
                            ? 'btn-primary text-white border-primary shadow-sm'
                            : 'btn-outline-secondary bg-light text-dark'
                        }`}
                        onClick={() => setEducationLevel('School')}
                      >
                        <School size={18} />
                        <span className="small fw-semibold">{t.tutoringPage.levelSchool}</span>
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        type="button"
                        className={`btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 border text-start ${
                          educationLevel === 'University'
                            ? 'btn-primary text-white border-primary shadow-sm'
                            : 'btn-outline-secondary bg-light text-dark'
                        }`}
                        onClick={() => setEducationLevel('University')}
                      >
                        <GraduationCap size={18} />
                        <span className="small fw-semibold">{t.tutoringPage.levelUniversity}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Conditional Academic Level Fields */}
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    {educationLevel === 'School' ? (
                      /* Grade 1 to 12 Dropdown */
                      <FormField
                        label={t.tutoringPage.schoolGrade}
                        name="gradeLevel"
                        value={schoolGrade}
                        onChange={(e) => setSchoolGrade(e.target.value as SchoolGrade)}
                        placeholder={t.tutoringPage.selectGradePrompt}
                        options={GRADE_KEYS.map((g) => ({
                          value: g.value,
                          label: t.tutoringPage.grades[g.key],
                        }))}
                        required
                      />
                    ) : (
                      /* University Standing / Field */
                      <FormField
                        label={t.tutoringPage.universityFieldLabel}
                        name="universityInfo"
                        value={universityInfo}
                        onChange={(e) => setUniversityInfo(e.target.value)}
                        placeholder={t.tutoringPage.universityFieldPlaceholder}
                        required
                      />
                    )}
                  </div>

                  <div className="col-12 col-md-6">
                    <FormField
                      label={t.tutoringPage.deliveryPref}
                      name="deliveryPreference"
                      value={deliveryPreference}
                      onChange={(e) =>
                        setDeliveryPreference(
                          e.target.value as 'Online' | 'In-Person / Home'
                        )
                      }
                      options={[
                        { value: 'In-Person / Home', label: t.tutoringPage.inPersonMode },
                        { value: 'Online', label: t.tutoringPage.onlineMode },
                      ]}
                      required
                    />
                  </div>
                </div>

                {/* Subjects */}
                <FormField
                  label={t.tutoringPage.subjects}
                  name="subjects"
                  placeholder={t.tutoringPage.subjectsPlaceholder}
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  required
                  helpText={
                    isAm
                      ? 'በርካታ ትምህርቶችን በነጠላ ሰረዝ (ኮማ) ይለዩ (ምሳሌ፡ ሂሳብ፣ ፊዚክስ)።'
                      : 'Separate multiple subjects with commas (e.g. Mathematics, Physics).'
                  }
                />

                {/* Contact Phone & Email */}
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <FormField
                      label={t.tutoringPage.phone}
                      name="parentOrContactPhone"
                      type="tel"
                      placeholder="e.g. +251 91 123 4567"
                      value={parentOrContactPhone}
                      onChange={(e) => setParentOrContactPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <FormField
                      label={t.tutoringPage.email}
                      name="email"
                      type="email"
                      placeholder="e.g. parent@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Location */}
                <FormField
                  label={t.tutoringPage.location}
                  name="locationDetails"
                  placeholder={t.tutoringPage.locationPlaceholder}
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                />

                {/* Submit to Payment Redirect */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-erkab btn-erkab-primary w-100 justify-content-center mt-3 py-2 fw-semibold d-flex align-items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="spinner-border spinner-border-sm" />
                      <span>{t.tutoringPage.submittingBtn}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.tutoringPage.submitBtn}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
