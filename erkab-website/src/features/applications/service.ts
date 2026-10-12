import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  StudentApplicationFormData,
  TrainerApplicationFormData,
  TutorApplicationFormData,
  ApplicationSubmissionResult,
} from './types';

export async function submitStudentApplication(
  data: StudentApplicationFormData
): Promise<ApplicationSubmissionResult> {
  const formData = new FormData();
  formData.append('fullName', data.fullName);
  formData.append('gender', data.gender);
  formData.append('age', data.age);
  formData.append('classCompletionYear', data.classCompletionYear);
  formData.append('telegramPhone', data.telegramPhone);
  formData.append('email', data.email);
  formData.append('selectedProgramId', data.selectedProgramId);

  if (data.educationCertificate) {
    formData.append('educationCertificate', data.educationCertificate);
  }
  if (data.nationalId) {
    formData.append('nationalId', data.nationalId);
  }
  if (data.ideaProposal) {
    formData.append('ideaProposal', data.ideaProposal);
  }

  try {
    const res = await apiClient<{ success: boolean; referenceNumber: string; message: string }>(
      API_ENDPOINTS.APPLICATIONS.STUDENT,
      {
        method: 'POST',
        body: formData,
      }
    );
    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Application submission failed';
    throw new Error(`Submission Error: ${message}. If the backend server is offline, please ensure the API server is running at ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}`);
  }
}

export async function submitTrainerApplication(
  data: TrainerApplicationFormData
): Promise<ApplicationSubmissionResult> {
  const formData = new FormData();
  formData.append('fullName', data.fullName);
  formData.append('email', data.email);
  formData.append('telegramPhone', data.telegramPhone);
  formData.append('expertiseTrack', data.expertiseTrack);
  formData.append('yearsOfExperience', data.yearsOfExperience);
  formData.append('portfolioUrl', data.portfolioUrl);
  formData.append('teachingStatement', data.teachingStatement);

  if (data.resumeFile) {
    formData.append('resumeFile', data.resumeFile);
  }

  try {
    const res = await apiClient<{ success: boolean; referenceNumber: string; message: string }>(
      API_ENDPOINTS.APPLICATIONS.TRAINER,
      {
        method: 'POST',
        body: formData,
      }
    );
    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Trainer application submission failed';
    throw new Error(`Submission Error: ${message}. Please ensure the backend server is active.`);
  }
}

export async function submitTutorApplication(
  data: TutorApplicationFormData
): Promise<ApplicationSubmissionResult> {
  const formData = new FormData();
  formData.append('studentOrApplicantName', data.fullName);
  formData.append('parentOrContactPhone', data.phone);
  if (data.email) {
    formData.append('email', data.email);
  }
  formData.append('gradeLevel', data.gradeLevel);
  formData.append('subjects', data.subjects);
  formData.append('deliveryPreference', data.deliveryPreference);
  if (data.locationDetails) {
    formData.append('locationDetails', data.locationDetails);
  }
  if (data.qualifications) {
    formData.append('qualifications', data.qualifications);
  }
  if (data.experience) {
    formData.append('experience', data.experience);
  }
  if (data.hourlyRate) {
    formData.append('hourlyRate', data.hourlyRate);
  }
  if (data.resumeFile) {
    formData.append('resumeFile', data.resumeFile);
  }

  try {
    const res = await apiClient<{ success: boolean; referenceNumber: string; message: string }>(
      API_ENDPOINTS.APPLICATIONS.TUTOR,
      {
        method: 'POST',
        body: formData,
      }
    );
    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Tutor application submission failed';
    throw new Error(`Submission Error: ${message}. Please ensure the backend server is active.`);
  }
}

