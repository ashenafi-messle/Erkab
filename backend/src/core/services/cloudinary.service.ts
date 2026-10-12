import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import { env } from '../../config/env';
import { logger } from '../logging/logger';
import { ValidationError, PayloadTooLargeError } from '../errors/AppError';

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface FileToUpload {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface UploadedFileResult {
  cloudinaryPublicId: string;
  cloudinarySecureUrl: string;
  cloudinaryResourceType: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
}

// Magic bytes validation
function detectBufferType(buffer: Buffer): { mime: string; ext: string } | null {
  if (!buffer || buffer.length < 4) return null;

  // PDF signature: %PDF (0x25 0x50 0x44 0x46)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return { mime: 'application/pdf', ext: 'pdf' };
  }

  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { mime: 'image/png', ext: 'png' };
  }

  // JPEG signature: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg' };
  }

  // DOCX / Office Open XML: PK\x03\x04
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04
  ) {
    return { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: 'docx' };
  }

  // DOC (legacy binary compound document): D0 CF 11 E0 A1 B1 1A E1
  if (
    buffer.length >= 8 &&
    buffer[0] === 0xd0 &&
    buffer[1] === 0xcf &&
    buffer[2] === 0x11 &&
    buffer[3] === 0xe0
  ) {
    return { mime: 'application/msword', ext: 'doc' };
  }

  return null;
}

export class CloudinaryService {
  private static isConfigured(): boolean {
    return (
      Boolean(env.CLOUDINARY_CLOUD_NAME) &&
      env.CLOUDINARY_CLOUD_NAME !== 'YOUR_CLOUD_NAME' &&
      Boolean(env.CLOUDINARY_API_KEY) &&
      env.CLOUDINARY_API_KEY !== 'YOUR_API_KEY' &&
      Boolean(env.CLOUDINARY_API_SECRET) &&
      env.CLOUDINARY_API_SECRET !== 'YOUR_API_SECRET'
    );
  }

  public static async uploadDocument(
    file: FileToUpload,
    subfolder: 'students' | 'trainers' | 'tutors',
    category: string
  ): Promise<UploadedFileResult> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new ValidationError(`Uploaded file for ${category} is empty or missing`);
    }

    if (file.size > env.MAX_FILE_SIZE_BYTES) {
      throw new PayloadTooLargeError(
        `File ${file.originalname} exceeds the maximum allowed size of 5MB`
      );
    }

    // Verify magic bytes
    const detected = detectBufferType(file.buffer);
    if (!detected) {
      throw new ValidationError(
        `File ${file.originalname} is not a valid document. Only PDF, Word (DOC/DOCX), JPEG, and PNG files are accepted.`
      );
    }

    // Check MIME type consistency (allowing generic binary streams reported by Windows browsers)
    const allowedMimes = [
      'application/pdf',
      'application/x-pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/octet-stream',
      'binary/octet-stream',
    ];
    if (!allowedMimes.includes(file.mimetype) && file.mimetype !== detected.mime) {
      throw new ValidationError(
        `File type mismatch for ${file.originalname}. Expected ${detected.mime}, received ${file.mimetype}`
      );
    }

    const sanitizedBase = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .slice(0, 50);
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const publicId = `erkab/applications/${subfolder}/${category.toLowerCase()}_${uniqueId}_${sanitizedBase}`;
    const resourceType = ['pdf', 'doc', 'docx'].includes(detected.ext) ? 'raw' : 'image';

    // If Cloudinary credentials are not configured (mock/dev fallback)
    if (!this.isConfigured()) {
      logger.warn(
        { category, filename: file.originalname },
        'Cloudinary credentials not configured; using secure mock storage identifier'
      );
      return {
        cloudinaryPublicId: `mock_${publicId}`,
        cloudinarySecureUrl: `https://res.cloudinary.com/mock-erkab/${publicId}`,
        cloudinaryResourceType: resourceType,
        originalFilename: file.originalname,
        fileType: detected.mime,
        fileSize: file.size,
      };
    }

    // Production Cloudinary Upload via buffer stream
    return new Promise<UploadedFileResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: resourceType as any,
          type: 'authenticated', // private authenticated access
          tags: ['erkab_application', subfolder, category],
          overwrite: true,
        },
        (error, result) => {
          if (error || !result) {
            logger.error({ error: error?.message, category }, 'Cloudinary upload failed');
            return reject(new Error('Cloudinary document upload failed'));
          }

          logger.info(
            { publicId: result.public_id, bytes: result.bytes },
            'Successfully uploaded document to Cloudinary'
          );

          resolve({
            cloudinaryPublicId: result.public_id,
            cloudinarySecureUrl: result.secure_url,
            cloudinaryResourceType: result.resource_type || resourceType,
            originalFilename: file.originalname,
            fileType: detected.mime,
            fileSize: file.size,
          });
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  public static async deleteAsset(publicId: string, resourceType = 'raw'): Promise<void> {
    if (!publicId || publicId.startsWith('mock_')) {
      return;
    }

    if (!this.isConfigured()) {
      return;
    }

    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType as any,
        type: 'authenticated',
      });
      logger.info({ publicId }, 'Cleaned up Cloudinary asset');
    } catch (err: any) {
      logger.warn({ publicId, error: err.message }, 'Failed to clean up Cloudinary asset');
    }
  }

  public static generateSignedReviewUrl(publicId: string, resourceType = 'raw'): string {
    if (!this.isConfigured() || publicId.startsWith('mock_')) {
      return `https://res.cloudinary.com/mock-erkab/${publicId}`;
    }

    // Generate signed authenticated delivery URL expiring in 1 hour
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    return cloudinary.utils.private_download_url(publicId, 'pdf', {
      resource_type: resourceType as any,
      type: 'authenticated',
      expires_at: expiresAt,
    });
  }
}
