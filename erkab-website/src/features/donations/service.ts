import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface DonationPledgeData {
  donorName: string;
  donorEmail: string;
  phone: string;
  supportArea: 'Student Scholarships' | 'Computer Lab Equipment' | 'Solar Power & Internet' | 'General Operations';
  amountOrItemsDescription: string;
}

export async function submitDonationPledge(data: DonationPledgeData) {
  return apiClient<{ success: boolean; message: string }>(API_ENDPOINTS.DONATIONS.PLEDGE, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
