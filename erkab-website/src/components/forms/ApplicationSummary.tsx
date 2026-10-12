'use client';

import React from 'react';
import { StudentApplicationFormData, TrainerApplicationFormData, TutorApplicationFormData } from '@/features/applications/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CheckCircle2, FileText } from 'lucide-react';

interface StudentSummaryProps {
  type: 'student';
  data: StudentApplicationFormData;
  programTitle: string;
}

interface TrainerSummaryProps {
  type: 'trainer';
  data: TrainerApplicationFormData;
}

interface TutorSummaryProps {
  type: 'tutor';
  data: TutorApplicationFormData;
}

type SummaryProps = StudentSummaryProps | TrainerSummaryProps | TutorSummaryProps;


export function ApplicationSummary(props: SummaryProps) {
  const { locale, t } = useLanguage();
  const isAm = locale === 'am';

  if (props.type === 'student') {
    const { data, programTitle } = props;
    return (
      <div className="bg-light p-4 rounded-3 text-start mb-4 border border-light-subtle">
        <h4 className="h6 fw-bold text-dark border-bottom pb-2 mb-3 d-flex align-items-center gap-2">
          <CheckCircle2 size={18} className="text-primary" />
          <span>{isAm ? 'የተማሪ ማመልከቻ ዝርዝር ማጠቃለያ' : 'Review Application Details'}</span>
        </h4>

        <div className="row g-3 small">
          <div className="col-12 col-sm-6">
            <span className="text-muted d-block">{t.applyStudent.fullName}</span>
            <strong className="text-dark">{data.fullName || '-'}</strong>
          </div>
          <div className="col-12 col-sm-6">
            <span className="text-muted d-block">{t.applyStudent.trackSelection}</span>
            <strong className="text-dark">{programTitle || (isAm ? 'አልተመረጠም' : 'Not selected')}</strong>
          </div>
          <div className="col-12 col-sm-6">
            <span className="text-muted d-block">{isAm ? 'ጾታ እና ዕድሜ' : 'Gender & Age'}</span>
            <strong className="text-dark">
              {data.gender || '-'}, {data.age ? `${data.age} ${isAm ? 'ዓመት' : 'years old'}` : '-'}
            </strong>
          </div>
          <div className="col-12 col-sm-6">
            <span className="text-muted d-block">{isAm ? 'የትምህርት ምረቃ ዓመት' : 'Class Completion Year'}</span>
            <strong className="text-dark">{data.classCompletionYear || '-'}</strong>
          </div>
          <div className="col-12 col-sm-6">
            <span className="text-muted d-block">{t.applyStudent.telegramPhone}</span>
            <strong className="text-dark">{data.telegramPhone || '-'}</strong>
          </div>
          <div className="col-12 col-sm-6">
            <span className="text-muted d-block">{t.applyStudent.email}</span>
            <strong className="text-dark">{data.email || '-'}</strong>
          </div>
        </div>

        <h5 className="h6 fw-bold text-dark border-bottom pb-2 mt-4 mb-3 d-flex align-items-center gap-2">
          <FileText size={18} className="text-primary" />
          <span>{isAm ? 'የተያያዙ ሰነዶች' : 'Attached Documents'}</span>
        </h5>

        <div className="d-flex flex-column gap-2 small">
          <div>
            <span className="text-muted">{t.applyStudent.docCert}: </span>
            <strong className="text-dark">
              {data.educationCertificate ? data.educationCertificate.name : (isAm ? 'አልተያያዘም' : 'Missing')}
            </strong>
          </div>
          <div>
            <span className="text-muted">{t.applyStudent.docId}: </span>
            <strong className="text-dark">
              {data.nationalId ? data.nationalId.name : (isAm ? 'አልተያያዘም' : 'Missing')}
            </strong>
          </div>
          <div>
            <span className="text-muted">{t.applyStudent.docProposal}: </span>
            <strong className="text-dark">
              {data.ideaProposal ? data.ideaProposal.name : (isAm ? 'አልተያያዘም' : 'Missing')}
            </strong>
          </div>
        </div>
      </div>
    );
  }

  if (props.type === 'trainer') {
    const { data } = props;
    return (
      <div className="bg-light p-4 rounded-3 text-start mb-4 border border-light-subtle">
        <h4 className="h6 fw-bold text-dark border-bottom pb-2 mb-3 d-flex align-items-center gap-2">
          <CheckCircle2 size={18} className="text-primary" />
          <span>{isAm ? 'የአሰልጣኝ ማመልከቻ ዝርዝር ማጠቃለያ' : 'Review Trainer Application'}</span>
        </h4>

        <div className="row g-3 small">
          <div className="col-12 col-sm-6">
            <span className="text-muted d-block">{t.applyTrainer.fullName}</span>
            <strong className="text-dark">{data.fullName || '-'}</strong>
          </div>
          <div className="col-12 col-sm-6">
            <span className="text-muted d-block">{t.applyTrainer.specialtyTrack}</span>
            <strong className="text-dark">{data.expertiseTrack || '-'}</strong>
          </div>
          <div className="col-12 col-sm-6">
            <span className="text-muted d-block">{t.applyTrainer.yearsExperience}</span>
            <strong className="text-dark">{data.yearsOfExperience || '-'}</strong>
          </div>
          <div className="col-12 col-sm-6">
            <span className="text-muted d-block">{isAm ? 'የቴሌግራም ስልክ ቁጥር' : 'Telegram Phone'}</span>
            <strong className="text-dark">{data.telegramPhone || '-'}</strong>
          </div>
          <div className="col-12 col-sm-6">
            <span className="text-muted d-block">{t.applyTrainer.email}</span>
            <strong className="text-dark">{data.email || '-'}</strong>
          </div>
          <div className="col-12 col-sm-6">
            <span className="text-muted d-block">{t.applyTrainer.portfolioLinkedinUrl}</span>
            <strong className="text-dark">{data.portfolioUrl || (isAm ? 'አልተገለጸም' : 'None provided')}</strong>
          </div>
        </div>

        <div className="mt-3 small">
          <span className="text-muted d-block">{t.applyTrainer.cvDocument}:</span>
          <strong className="text-dark">
            {data.resumeFile ? data.resumeFile.name : (isAm ? 'አልተያያዘም' : 'Missing')}
          </strong>
        </div>
      </div>
    );
  }

  const { data } = props;
  return (
    <div className="bg-light p-4 rounded-3 text-start mb-4 border border-light-subtle">
      <h4 className="h6 fw-bold text-dark border-bottom pb-2 mb-3 d-flex align-items-center gap-2">
        <CheckCircle2 size={18} className="text-primary" />
        <span>{isAm ? 'የአካዳሚክ መካሪ/ሞግዚት ማመልከቻ ዝርዝር' : 'Review Tutor Application'}</span>
      </h4>

      <div className="row g-3 small">
        <div className="col-12 col-sm-6">
          <span className="text-muted d-block">{isAm ? 'ሙሉ ስም' : 'Full Name'}</span>
          <strong className="text-dark">{data.fullName || '-'}</strong>
        </div>
        <div className="col-12 col-sm-6">
          <span className="text-muted d-block">{isAm ? 'የስልክ ቁጥር' : 'Contact Phone'}</span>
          <strong className="text-dark">{data.phone || '-'}</strong>
        </div>
        <div className="col-12 col-sm-6">
          <span className="text-muted d-block">{isAm ? 'የሚያስተምሯቸው የትምህርት አይነቶች' : 'Subjects'}</span>
          <strong className="text-dark">{data.subjects || '-'}</strong>
        </div>
        <div className="col-12 col-sm-6">
          <span className="text-muted d-block">{isAm ? 'የክፍል ደረጃ' : 'Grade / Education Level'}</span>
          <strong className="text-dark">{data.gradeLevel || '-'}</strong>
        </div>
        <div className="col-12 col-sm-6">
          <span className="text-muted d-block">{isAm ? 'የአሰጣጥ ምርጫ' : 'Delivery Preference'}</span>
          <strong className="text-dark">{data.deliveryPreference || '-'}</strong>
        </div>
        <div className="col-12 col-sm-6">
          <span className="text-muted d-block">{isAm ? 'ኢሜይል' : 'Email Address'}</span>
          <strong className="text-dark">{data.email || (isAm ? 'አልተገለጸም' : 'None provided')}</strong>
        </div>
      </div>

      <div className="mt-3 small">
        <span className="text-muted d-block">{isAm ? 'የተያያዘ የCV ሰነድ' : 'Attached CV'}:</span>
        <strong className="text-dark">
          {data.resumeFile ? data.resumeFile.name : (isAm ? 'አልተያያዘም (አማራጭ)' : 'None (Optional)')}
        </strong>
      </div>
    </div>
  );
}

