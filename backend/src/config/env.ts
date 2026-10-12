import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://127.0.0.1:3000,https://erkab-website.vercel.app,https://erkab.org,https://www.erkab.org'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  CLOUDINARY_CLOUD_NAME: z.string().default('YOUR_CLOUD_NAME'),
  CLOUDINARY_API_KEY: z.string().default('YOUR_API_KEY'),
  CLOUDINARY_API_SECRET: z.string().default('YOUR_API_SECRET'),
  MAX_FILE_SIZE_BYTES: z.coerce.number().default(5 * 1024 * 1024), // 5MB
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 mins
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(200),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  throw new Error('Environment variable validation failed');
}

export const env = parsed.data;

export const corsOriginsList = env.CORS_ORIGINS.split(',').map((origin) => origin.trim());
