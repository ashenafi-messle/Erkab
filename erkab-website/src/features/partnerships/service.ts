import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface PartnershipSubmissionData {
  organizationName: string;
  organizationType: string;
  contactPerson: string;
  email: string;
  phone: string;
  country?: string;
  city?: string;
  partnershipType: string;
  proposal?: string;
  organizationLicense: File;
}

export interface PartnershipSubmissionResponse {
  reference: string;
  referenceNumber?: string;
  status?: string;
  message: string;
  document?: {
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
  };
}

export async function submitPartnershipRequest(data: PartnershipSubmissionData): Promise<PartnershipSubmissionResponse> {
  const formData = new FormData();
  formData.append('organizationName', data.organizationName);
  formData.append('organizationType', data.organizationType);
  formData.append('contactPerson', data.contactPerson);
  formData.append('email', data.email);
  formData.append('phone', data.phone);
  if (data.country) formData.append('country', data.country);
  if (data.city) formData.append('city', data.city);
  formData.append('partnershipType', data.partnershipType);
  if (data.proposal) formData.append('proposal', data.proposal);
  formData.append('organizationLicense', data.organizationLicense);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${API_ENDPOINTS.PARTNERSHIPS.SUBMIT}`, {
    method: 'POST',
    body: formData,
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    const details = Array.isArray(json.error?.details)
      ? json.error.details.map((d: any) => `${d.field ? d.field + ': ' : ''}${d.message}`).join(', ')
      : null;
    const errorMsg = details || json.error?.message || json.message || 'Partnership request submission failed';
    throw new Error(errorMsg);
  }

  const payload = json.data || json || {};
  const ref = payload.reference || payload.referenceNumber || json.reference || json.referenceNumber || '';
  return {
    ...payload,
    reference: ref,
    referenceNumber: ref,
  };
}

// Backward compatibility alias
export async function submitPartnershipInquiry(data: {
  organizationName: string;
  contactPerson: string;
  email: string;
  phone: string;
  partnershipType: string;
  message: string;
  organizationLicense?: File;
}) {
  if (!data.organizationLicense) {
    throw new Error('Organization license document is required.');
  }
  return submitPartnershipRequest({
    organizationName: data.organizationName,
    organizationType: 'NGO',
    contactPerson: data.contactPerson,
    email: data.email,
    phone: data.phone,
    partnershipType: data.partnershipType,
    proposal: data.message,
    organizationLicense: data.organizationLicense,
  });
}
