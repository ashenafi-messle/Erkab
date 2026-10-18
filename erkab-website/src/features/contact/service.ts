import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface ContactMessageData {
  fullName: string;
  email: string;
  phone?: string;
  category: string;
  subject: string;
  message: string;
  hp_organization?: string;
}

export interface ContactMessageResponse {
  success: boolean;
  message: string;
  data: {
    referenceCode: string;
  };
}

export async function sendContactMessage(data: ContactMessageData): Promise<ContactMessageResponse> {
  return apiClient<ContactMessageResponse>(API_ENDPOINTS.CONTACT.SEND, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
