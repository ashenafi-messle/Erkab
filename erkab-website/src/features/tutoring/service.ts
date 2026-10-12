import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export const SCHOOL_GRADES = [
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
] as const;

export type SchoolGrade = (typeof SCHOOL_GRADES)[number];

export interface TutoringRequestData {
  studentName: string;
  educationLevel: 'School' | 'University';
  gradeLevel: string;
  subjects: string[];
  deliveryPreference: 'Online' | 'In-Person / Home';
  parentOrContactPhone: string;
  email?: string;
  locationDetails?: string;
}

export interface TutoringSubmissionResponse {
  success: boolean;
  referenceNumber: string;
  paymentReference?: string;
  paymentUrl?: string;
  amount?: number;
  currency?: string;
  message: string;
}

export interface TutoringPaymentDetails {
  paymentReference: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
  paymentMode: 'DEMO';
  transactionId?: string | null;
  tutoringReference: string;
  studentName: string;
  gradeLevel: string;
  subjects: string;
  deliveryPreference: string;
  tutoringStatus: string;
  createdAt: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  alreadyConfirmed?: boolean;
  status: 'SUCCEEDED' | 'FAILED';
  paymentReference: string;
  transactionId?: string;
  tutoringReference: string;
  amount: number;
  currency: string;
  message: string;
}

export async function submitTutoringRequest(data: TutoringRequestData): Promise<TutoringSubmissionResponse> {
  return apiClient<TutoringSubmissionResponse>(
    API_ENDPOINTS.TUTORING.REQUEST,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export async function getTutoringPayment(reference: string): Promise<TutoringPaymentDetails> {
  const res = await apiClient<{ success: boolean; data: TutoringPaymentDetails }>(
    API_ENDPOINTS.TUTORING.PAYMENT(reference),
    {
      method: 'GET',
    }
  );
  return res.data;
}

export async function confirmDemoPayment(
  reference: string,
  simulatedOutcome: 'SUCCESS' | 'FAILURE' = 'SUCCESS'
): Promise<ConfirmPaymentResponse> {
  return apiClient<ConfirmPaymentResponse>(
    API_ENDPOINTS.TUTORING.CONFIRM_DEMO(reference),
    {
      method: 'POST',
      body: JSON.stringify({ simulatedOutcome }),
    }
  );
}
