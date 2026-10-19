import { z } from 'zod';

export const studentApplicationSchema = z.object({
  fullName: z.string().trim().min(3, 'Full name must be at least 3 characters'),
  gender: z.string().trim().min(1, 'Gender is required'),
  age: z.coerce.number().int().min(16, 'Minimum age is 16').max(80, 'Please enter a valid age'),
  classCompletionYear: z.string().trim().min(2, 'Completion year is required'),
  telegramPhone: z.string().trim().min(9, 'Valid Telegram phone number is required'),
  email: z.string().trim().email('Valid email address is required'),
  selectedProgramId: z.string().trim().min(1, 'Training program selection is required'),
});

export const trainerApplicationSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().email('Valid email address is required'),
  telegramPhone: z.string().trim().min(8, 'Valid Telegram phone number is required'),
  expertiseTrack: z.string().trim().min(1, 'Expertise track is required'),
  yearsOfExperience: z.string().trim().min(1, 'Years of experience is required'),
  portfolioUrl: z.string().trim().optional().or(z.literal('')),
  teachingStatement: z.string().trim().min(5, 'Teaching statement must be at least 5 characters'),
});

export const VALID_SCHOOL_GRADES = [
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

export function isValidGradeLevel(val: string): boolean {
  const trimmed = val.trim();
  if (VALID_SCHOOL_GRADES.includes(trimmed as any)) return true;
  if (
    trimmed.toLowerCase().includes('university') ||
    trimmed.toLowerCase().includes('higher') ||
    trimmed.toLowerCase().includes('year') ||
    trimmed.toLowerCase().includes('college') ||
    trimmed.toLowerCase().includes('freshman') ||
    trimmed.toLowerCase().includes('sophomore') ||
    trimmed.toLowerCase().includes('junior') ||
    trimmed.toLowerCase().includes('senior')
  ) {
    return true;
  }
  return false;
}

export const tutorApplicationSchema = z
  .object({
    studentName: z.string().trim().min(2, 'Student or applicant name is required').optional(),
    studentOrApplicantName: z.string().trim().min(2, 'Student or applicant name is required').optional(),
    parentOrContactPhone: z.string().trim().min(9, 'Contact phone number is required'),
    email: z.string().trim().email('Valid email address is required').optional().or(z.literal('')),
    educationLevel: z.string().trim().optional(),
    gradeLevel: z.string().trim().min(1, 'Academic grade level is required'),
    subjects: z.union([z.string(), z.array(z.string())]),
    deliveryPreference: z.string().trim().min(1, 'Delivery preference is required'),
    locationDetails: z.string().trim().optional(),
    qualifications: z.string().trim().optional(),
    experience: z.string().trim().optional(),
    hourlyRate: z.string().trim().optional(),
    receiptUrl: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    const level = (data.educationLevel || '').trim().toLowerCase();
    const isSchool =
      level === 'school' ||
      level === 'elementary' ||
      level === 'high school' ||
      level === 'elementary & high school';

    if (isSchool) {
      if (!VALID_SCHOOL_GRADES.includes(data.gradeLevel.trim() as any)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['gradeLevel'],
          message: 'Invalid grade level. School-level tutoring must be one of Grade 1 through Grade 12.',
        });
      }
    } else if (!isValidGradeLevel(data.gradeLevel)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['gradeLevel'],
        message: 'Invalid grade level. School-level tutoring must be one of Grade 1 through Grade 12.',
      });
    }

    if (data.receiptUrl) {
      const res = validateReceiptUrlSafe(data.receiptUrl);
      if (!res.valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['receiptUrl'],
          message: res.error,
        });
      }
    }
  });

export function validateReceiptUrlSafe(url: string): { valid: boolean; error: string } {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return { valid: false, error: 'Bank receipt or transaction verification link is required.' };
  }

  const trimmed = url.trim();

  if (trimmed.length > 2048) {
    return { valid: false, error: 'Receipt URL exceeds maximum allowed length of 2048 characters.' };
  }

  if (/[\x00-\x1F\x7F\s]/.test(trimmed)) {
    return { valid: false, error: 'Receipt URL contains invalid characters or whitespace.' };
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== 'https:') {
      return { valid: false, error: 'Receipt URL must use a secure HTTPS protocol (https://).' };
    }

    if (parsed.username || parsed.password) {
      return { valid: false, error: 'Receipt URL must not contain embedded authentication credentials.' };
    }

    const hostname = parsed.hostname.toLowerCase();
    if (
      !hostname ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.endsWith('.local') ||
      !hostname.includes('.')
    ) {
      return { valid: false, error: 'Receipt URL must contain a valid public domain name.' };
    }

    return { valid: true, error: '' };
  } catch {
    return { valid: false, error: 'Receipt URL is malformed. Please enter a valid HTTPS URL.' };
  }
}

export const receiptSubmissionSchema = z.object({
  receiptUrl: z
    .string()
    .trim()
    .min(1, 'Bank receipt or transaction verification link is required.')
    .superRefine((val, ctx) => {
      const result = validateReceiptUrlSafe(val);
      if (!result.valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.error,
        });
      }
    }),
});

export const confirmPaymentSchema = z.object({
  simulatedOutcome: z.enum(['SUCCESS', 'FAILURE']).optional().default('SUCCESS'),
});


