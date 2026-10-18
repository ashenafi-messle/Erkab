import { z } from 'zod';

const booleanCoerce = z.preprocess((val) => {
  if (typeof val === 'string') {
    if (val.toLowerCase() === 'true' || val === '1') return true;
    if (val.toLowerCase() === 'false' || val === '0') return false;
  }
  return val;
}, z.boolean());

export const createProgramSchema = z.object({
  title: z.string().trim().min(3, 'Program title must be at least 3 characters').max(150, 'Title is too long'),
  slug: z.string().trim().optional(),
  category: z.string().trim().min(2, 'Category is required'),
  duration: z.string().trim().min(2, 'Duration is required'),
  delivery: z.string().trim().min(2, 'Delivery mode is required'),
  scholarship: booleanCoerce.default(true),
  image: z.string().trim().optional(),
  imageAlt: z.string().trim().optional(),
  summary: z.string().trim().optional(),
  description: z.string().trim().min(20, 'Full description must be at least 20 characters'),
  skills: z.union([z.array(z.string()), z.string()]).default([]),
  modules: z.union([z.array(z.string()), z.string()]).default([]),
  careerPaths: z.union([z.array(z.string()), z.string()]).default([]),
  prerequisites: z.string().trim().default('Basic computer literacy and logical problem-solving aptitude.'),
  isPublished: booleanCoerce.default(true),
});

export const updateProgramSchema = createProgramSchema.partial();

export const publishProgramSchema = z.object({
  isPublished: booleanCoerce,
});
