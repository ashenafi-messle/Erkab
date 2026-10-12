export interface StudentApplicationFormData {
  fullName: string;
  gender: string;
  age: string;
  classCompletionYear: string;
  telegramPhone: string;
  email: string;
  selectedProgramId: string;
  educationCertificate: File | null;
  nationalId: File | null;
  ideaProposal: File | null;
}

export interface TrainerApplicationFormData {
  fullName: string;
  email: string;
  telegramPhone: string;
  expertiseTrack: string;
  yearsOfExperience: string;
  portfolioUrl: string;
  resumeFile: File | null;
  teachingStatement: string;
}

export interface TutorApplicationFormData {
  fullName: string;
  email?: string;
  phone: string;
  subjects: string;
  gradeLevel: string;
  deliveryPreference: string;
  locationDetails?: string;
  qualifications?: string;
  experience?: string;
  hourlyRate?: string;
  resumeFile?: File | null;
}

export interface ApplicationSubmissionResult {
  success: boolean;
  referenceNumber?: string;
  message?: string;
}

