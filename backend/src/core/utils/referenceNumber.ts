import crypto from 'crypto';

export type ApplicationTypePrefix = 'STU' | 'TRN' | 'TUT' | 'PAY';

export function generateReferenceNumber(type: ApplicationTypePrefix): string {
  const year = new Date().getFullYear();
  const randomChars = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
  return `ERK-${type}-${year}-${randomChars}`;
}
