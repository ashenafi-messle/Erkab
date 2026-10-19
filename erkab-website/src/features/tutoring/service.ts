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
  status: 'PENDING' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
  tutoringReference: string;
  studentName: string;
  gradeLevel: string;
  subjects: string;
  deliveryPreference: string;
  tutoringStatus: string;
  createdAt: string;
  receiptUrl?: string;
  receiptSubmittedAt?: string;
}

export interface ReceiptSubmissionResponse {
  success: boolean;
  message: string;
  paymentReference: string;
  tutoringReference: string;
  paymentStatus: string;
  tutoringStatus: string;
  receiptSubmittedAt: string;
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

export async function submitTutoringReceipt(
  paymentReference: string,
  receiptUrl: string
): Promise<ReceiptSubmissionResponse> {
  return apiClient<ReceiptSubmissionResponse>(
    API_ENDPOINTS.TUTORING.RECEIPT(paymentReference),
    {
      method: 'POST',
      body: JSON.stringify({ receiptUrl }),
    }
  );
}
