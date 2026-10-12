import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface ContactMessageData {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactMessage(data: ContactMessageData) {
  return apiClient<{ success: boolean; message: string }>(API_ENDPOINTS.CONTACT.SEND, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
