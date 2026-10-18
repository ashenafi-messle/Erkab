import { z } from 'zod';

export const ALLOWED_CATEGORIES = [
  'GENERAL_INQUIRY',
  'TRAINING_PROGRAMS',
  'SCHOLARSHIP_APPLICATION',
  'TUTORING',
  'PARTNERSHIP_MENTORSHIP',
  'DONATIONS',
  'TECHNICAL_SUPPORT',
  'OTHER',
] as const;

export type InquiryCategory = (typeof ALLOWED_CATEGORIES)[number];

// Normalizer mapping human-friendly category names to canonical enum keys
const CATEGORY_MAP: Record<string, InquiryCategory> = {
  general_inquiry: 'GENERAL_INQUIRY',
  'general inquiry': 'GENERAL_INQUIRY',
  general: 'GENERAL_INQUIRY',
  training_programs: 'TRAINING_PROGRAMS',
  'training programs': 'TRAINING_PROGRAMS',
  programs: 'TRAINING_PROGRAMS',
  scholarship_application: 'SCHOLARSHIP_APPLICATION',
  'scholarship application': 'SCHOLARSHIP_APPLICATION',
  scholarship: 'SCHOLARSHIP_APPLICATION',
  tutoring: 'TUTORING',
  'tutoring services': 'TUTORING',
  partnership_mentorship: 'PARTNERSHIP_MENTORSHIP',
  'partnership and mentorship': 'PARTNERSHIP_MENTORSHIP',
  'partnership & mentorship': 'PARTNERSHIP_MENTORSHIP',
  partnership: 'PARTNERSHIP_MENTORSHIP',
  donations: 'DONATIONS',
  donation: 'DONATIONS',
  technical_support: 'TECHNICAL_SUPPORT',
  'technical support': 'TECHNICAL_SUPPORT',
  other: 'OTHER',
};

export const contactSubmissionSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .refine((val) => !/[\u0000-\u001F\u007F]/.test(val), {
      message: 'Name contains invalid control characters',
    }),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(150, 'Email address is too long')
    .transform((val) => val.toLowerCase()),
  phone: z
    .string()
    .trim()
    .max(30, 'Phone number cannot exceed 30 characters')
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject cannot exceed 200 characters'),
  category: z
    .string()
    .trim()
    .transform((val) => {
      const lower = val.toLowerCase();
      if (CATEGORY_MAP[lower]) return CATEGORY_MAP[lower];
      return val.toUpperCase() as InquiryCategory;
    })
    .refine((val) => ALLOWED_CATEGORIES.includes(val as any), {
      message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`,
    }),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters long')
    .max(4000, 'Message cannot exceed 4000 characters'),
  // Hidden Honeypot field for bot/spam resistance
  hp_organization: z.string().optional().nullable(),
  honeypot: z.string().optional().nullable(),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;

export const adminUpdateContactSchema = z.object({
  status: z
    .enum(['NEW', 'IN_PROGRESS', 'WAITING_FOR_VISITOR', 'RESOLVED', 'CLOSED', 'SPAM'])
    .optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  assignedAdminId: z.string().max(64).nullable().optional(),
  internalNotes: z.string().max(3000).nullable().optional(),
});

export type AdminUpdateContactInput = z.infer<typeof adminUpdateContactSchema>;
