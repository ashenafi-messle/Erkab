import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface PartnershipInquiryData {
  organizationName: string;
  contactPerson: string;
  email: string;
  phone: string;
  partnershipType: 'Funding / Scholarships' | 'Equipment & Labs' | 'Internships & Hiring' | 'Curriculum & Mentorship';
  message: string;
}

export async function submitPartnershipInquiry(data: PartnershipInquiryData) {
  return apiClient<{ success: boolean; message: string }>(API_ENDPOINTS.PARTNERSHIPS.INQUIRY, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
