import { z } from 'zod';

export const createNewsArticleSchema = z.object({
  title: z.string().trim().min(3, 'Title is required (minimum 3 characters)'),
  slug: z
    .string()
    .trim()
    .min(3, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  excerpt: z.string().trim().min(5, 'Excerpt summary is required (minimum 5 characters)'),
  content: z.string().trim().min(10, 'Article content is required (minimum 10 characters)'),
  category: z.string().trim().default('General'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  coverImageAssetId: z.string().trim().optional().or(z.literal('')),
  coverImageUrl: z.string().trim().optional().or(z.literal('')),
  authorName: z.string().trim().optional().or(z.literal('')),
  publishedAt: z.string().optional().or(z.literal('')),
});

export const updateNewsArticleSchema = createNewsArticleSchema.partial();

export const newsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  category: z.string().trim().optional(),
  status: z.string().trim().optional(),
});
