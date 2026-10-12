import { z } from 'zod';

export const createPartnershipSchema = z.object({
  organizationName: z.string().trim().min(2, 'Organization name is required (at least 2 characters)'),
  organizationType: z.string().trim().min(2, 'Organization type is required'),
  contactPerson: z.string().trim().min(2, 'Contact person name is required'),
  email: z.string().trim().email('Valid email address is required'),
  phone: z.string().trim().min(9, 'Valid phone number is required'),
  country: z.string().trim().optional(),
  city: z.string().trim().optional(),
  partnershipType: z.string().trim().min(2, 'Partnership type is required'),
  proposal: z.string().trim().min(5, 'Partnership proposal or collaboration message is required (at least 5 characters)'),
});

export const reviewPartnershipSchema = z.object({
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN']),
  reviewNotes: z.string().trim().optional(),
});
