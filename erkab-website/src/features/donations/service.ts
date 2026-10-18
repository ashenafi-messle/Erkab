import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface DonationCampaign {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageAssetId?: string | null;
  goalAmountMinor?: number | null;
  currency: string;
}

export interface DonationCreateData {
  amount: number;
  currency?: string;
  campaignSlug?: string;
  donorName?: string;
  email?: string;
  phone?: string;
  message?: string;
  isAnonymous?: boolean;
}

export interface DonationCreateResponse {
  reference: string;
  amount: number;
  currency: string;
  status: string;
  paymentReference: string;
  checkoutUrl: string;
}

export interface DonationPaymentDetail {
  reference: string;
  donationReference: string;
  amount: number;
  currency: string;
  provider: string;
  mode: string;
  status: string;
  campaign?: {
    title: string;
    slug: string;
  } | null;
  verifiedAt?: string | null;
  createdAt: string;
}

const DEFAULT_CAMPAIGNS: DonationCampaign[] = [
  {
    id: 'camp-1',
    slug: 'scholarships',
    title: 'Student Scholarships Fund',
    description: 'Fund 12-week intensive bootcamps for disadvantaged youth across Gondar.',
    currency: 'ETB',
  },
  {
    id: 'camp-2',
    slug: 'hardware-labs',
    title: 'Computer Lab Workstations',
    description: 'Equip workstations with laptops, dual monitors, and fast local network switches.',
    currency: 'ETB',
  },
  {
    id: 'camp-3',
    slug: 'solar-connectivity',
    title: 'Solar Power & High-Speed Internet',
    description: 'Ensure 24/7 uptime during power interruptions with battery backup systems.',
    currency: 'ETB',
  },
];

export async function getDonationCampaigns(): Promise<DonationCampaign[]> {
  try {
    const res = await apiClient<{ success: boolean; data: DonationCampaign[] }>(
      API_ENDPOINTS.DONATIONS.CAMPAIGNS
    );
    if (res.data && res.data.length > 0) {
      return res.data;
    }
    return DEFAULT_CAMPAIGNS;
  } catch (err) {
    return DEFAULT_CAMPAIGNS;
  }
}

export async function createDonation(data: DonationCreateData): Promise<DonationCreateResponse> {
  const res = await apiClient<any>(
    API_ENDPOINTS.DONATIONS.CREATE,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  return res?.data || res;
}

export async function getDonationPayment(reference: string): Promise<DonationPaymentDetail> {
  const res = await apiClient<any>(
    API_ENDPOINTS.DONATIONS.PAYMENT(reference)
  );
  return res?.data || res;
}
