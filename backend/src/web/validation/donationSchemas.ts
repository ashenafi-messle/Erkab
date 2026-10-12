import { z } from 'zod';

export const createDonationSchema = z.object({
  amount: z.coerce
    .number()
    .positive('Donation amount must be greater than 0')
    .min(10, 'Minimum donation amount is 10 ETB')
    .max(10000000, 'Donation amount exceeds maximum permitted threshold'),
  currency: z.string().trim().default('ETB'),
  donorName: z.string().trim().optional().or(z.literal('')),
  email: z.string().trim().email('Valid email address is required for donation receipt and verification'),
  phone: z.string().trim().optional().or(z.literal('')),
  campaignSlug: z.string().trim().optional(),
  campaignId: z.string().trim().optional(),
  isAnonymous: z.coerce.boolean().default(false),
  message: z.string().trim().max(500, 'Message cannot exceed 500 characters').optional().or(z.literal('')),
});

export const confirmDonationPaymentSchema = z.object({
  simulatedOutcome: z.enum(['SUCCESS', 'FAILURE']).optional().default('SUCCESS'),
});
