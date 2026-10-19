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

  // WebP signature: RIFF....WEBP (52 49 46 46 .... 57 45 42 50)
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { mime: 'image/webp', ext: 'webp' };
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
    subfolder: 'students' | 'trainers' | 'tutors' | 'partnerships' | 'news',
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

  /**
   * Upload public training program cover images directly to Cloudinary
   * Accessible by public website visitors with CDN optimization
   */
  public static async uploadProgramImage(
    file: FileToUpload,
    slugOrTitle: string
  ): Promise<{
    publicId: string;
    secureUrl: string;
    format: string;
    bytes: number;
    width?: number;
    height?: number;
  }> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new ValidationError('Program image file is empty or missing');
    }

    if (file.size > env.MAX_FILE_SIZE_BYTES) {
      throw new PayloadTooLargeError(`Image ${file.originalname} exceeds the maximum allowed size of 5MB`);
    }

    // Verify magic bytes
    const detected = detectBufferType(file.buffer);
    if (!detected || !['image/jpeg', 'image/png', 'image/webp'].includes(detected.mime)) {
      throw new ValidationError(
        `File ${file.originalname} is not a valid image format. Only JPEG, PNG, and WebP images are accepted.`
      );
    }

    const sanitizedBase = (slugOrTitle || file.originalname)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '_')
      .slice(0, 40);
    const uniqueId = crypto.randomBytes(6).toString('hex');
    const publicId = `${sanitizedBase}_${uniqueId}`;

    if (!this.isConfigured()) {
      logger.warn(
        { publicId, filename: file.originalname },
        'Cloudinary credentials not configured; using secure mock storage identifier for program image'
      );
      return {
        publicId: `mock_${publicId}`,
        secureUrl: `https://res.cloudinary.com/mock-erkab/${publicId}.${detected.ext}`,
        format: detected.ext,
        bytes: file.size,
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: 'image',
          type: 'upload', // Public delivery for website visitors
          folder: 'erkab/programs',
          overwrite: true,
          transformation: [
            { width: 1200, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) {
            logger.error({ error: error?.message, publicId }, 'Cloudinary program image upload failed');
            return reject(new Error('Failed to upload program image to Cloudinary'));
          }

          logger.info(
            { publicId: result.public_id, secureUrl: result.secure_url, bytes: result.bytes },
            'Successfully uploaded program image to Cloudinary'
          );

          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
            format: result.format || detected.ext,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
          });
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  /**
   * Delete public program image from Cloudinary (used during replacement or cleanup)
   */
  public static async deleteProgramImage(publicIdOrUrl: string): Promise<void> {
    const publicId = this.extractPublicIdFromUrl(publicIdOrUrl);
    if (!publicId || publicId.startsWith('mock_') || !publicId.startsWith('erkab/programs/')) {
      return;
    }

    if (!this.isConfigured()) return;

    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
        type: 'upload',
      });
      logger.info({ publicId }, 'Cleaned up old program image from Cloudinary');
    } catch (err: any) {
      logger.warn({ publicId, error: err.message }, 'Failed to delete old program image from Cloudinary');
    }
  }

  /**
   * Upload public news announcement image directly to Cloudinary
   */
  public static async uploadNewsImage(
    file: FileToUpload,
    slugOrTitle: string
  ): Promise<{
    publicId: string;
    secureUrl: string;
    format: string;
    bytes: number;
    width?: number;
    height?: number;
  }> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new ValidationError('Announcement image file is empty or missing');
    }

    if (file.size > env.MAX_FILE_SIZE_BYTES) {
      throw new PayloadTooLargeError(`Image ${file.originalname} exceeds the maximum allowed size of 5MB`);
    }

    const detected = detectBufferType(file.buffer);
    if (!detected || !['image/jpeg', 'image/png', 'image/webp'].includes(detected.mime)) {
      throw new ValidationError(
        `File ${file.originalname} is not a valid image format. Only JPEG, PNG, and WebP images are accepted.`
      );
    }

    const sanitizedBase = (slugOrTitle || file.originalname)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '_')
      .slice(0, 40);
    const uniqueId = crypto.randomBytes(6).toString('hex');
    const publicId = `news_${sanitizedBase}_${uniqueId}`;

    if (!this.isConfigured()) {
      logger.warn(
        { publicId, filename: file.originalname },
        'Cloudinary credentials not configured; using secure mock storage identifier for news image'
      );
      return {
        publicId: `mock_${publicId}`,
        secureUrl: `https://res.cloudinary.com/mock-erkab/${publicId}.${detected.ext}`,
        format: detected.ext,
        bytes: file.size,
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: 'image',
          type: 'upload',
          folder: 'erkab/news',
          overwrite: true,
          transformation: [
            { width: 1600, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) {
            logger.error({ error: error?.message, publicId }, 'Cloudinary news image upload failed');
            return reject(new Error('Failed to upload announcement image to Cloudinary'));
          }

          logger.info(
            { publicId: result.public_id, secureUrl: result.secure_url, bytes: result.bytes },
            'Successfully uploaded announcement image to Cloudinary'
          );

          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
            format: result.format || detected.ext,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
          });
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  /**
   * Delete public news image from Cloudinary
   */
  public static async deleteNewsImage(publicIdOrUrl: string): Promise<void> {
    const publicId = this.extractPublicIdFromUrl(publicIdOrUrl);
    if (!publicId || publicId.startsWith('mock_')) {
      return;
    }

    if (!this.isConfigured()) return;

    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
        type: 'upload',
      });
      logger.info({ publicId }, 'Cleaned up news announcement image from Cloudinary');
    } catch (err: any) {
      logger.warn({ publicId, error: err.message }, 'Failed to delete news image from Cloudinary');
    }
  }

  /**
   * Extract Cloudinary publicId from a secureUrl or raw identifier
   */
  public static extractPublicIdFromUrl(urlOrId: string): string {
    if (!urlOrId) return '';
    if (!urlOrId.startsWith('http')) return urlOrId;
    try {
      const match = urlOrId.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
      return match ? match[1] : '';
    } catch {
      return '';
    }
  }

  public static generateSignedReviewUrl(
    publicId: string,
    resourceType = 'raw',
    format?: string
  ): string {
    if (!this.isConfigured() || publicId.startsWith('mock_')) {
      return `https://res.cloudinary.com/mock-erkab/${publicId}`;
    }

    // Generate signed authenticated download URL expiring in 1 hour
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;

    let ext = format;
    if (!ext) {
      if (publicId.includes('.')) {
        ext = publicId.split('.').pop()?.toLowerCase();
      } else {
        ext = resourceType === 'raw' ? 'pdf' : 'jpg';
      }
    }

    try {
      // Authenticated raw and image assets require private_download_url
      return cloudinary.utils.private_download_url(publicId, ext || '', {
        resource_type: resourceType as any,
        type: 'authenticated',
        expires_at: expiresAt,
      });
    } catch (err: any) {
      logger.warn({ publicId, error: err?.message }, 'Failed to generate private download URL, falling back');
      return cloudinary.url(publicId, {
        resource_type: resourceType as any,
        type: 'authenticated',
        sign_url: true,
        expires_at: expiresAt,
        secure: true,
      });
    }
  }

  public static async fetchAssetStream(
    publicId: string,
    resourceType = 'raw',
    format?: string
  ): Promise<{ stream: any; statusCode: number; headers: Record<string, any> }> {
    const downloadUrl = this.generateSignedReviewUrl(publicId, resourceType, format);

    if (downloadUrl.startsWith('https://res.cloudinary.com/mock-erkab/')) {
      const { Readable } = await import('stream');
      const mockStream = Readable.from([
        Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF'),
      ]);
      return {
        stream: mockStream,
        statusCode: 200,
        headers: {
          'content-type': 'application/pdf',
          'content-disposition': 'inline; filename="mock_document.pdf"',
        },
      };
    }

    const https = await import('https');
    const http = await import('http');

    const fetchWithRedirect = (targetUrl: string, redirectsLeft = 3): Promise<{ stream: any; statusCode: number; headers: Record<string, any> }> => {
      return new Promise((resolve, reject) => {
        const client = targetUrl.startsWith('https:') ? https : http;
        client.get(targetUrl, (streamRes) => {
          if (
            streamRes.statusCode &&
            streamRes.statusCode >= 300 &&
            streamRes.statusCode < 400 &&
            streamRes.headers.location &&
            redirectsLeft > 0
          ) {
            return resolve(fetchWithRedirect(streamRes.headers.location, redirectsLeft - 1));
          }
          resolve({
            stream: streamRes,
            statusCode: streamRes.statusCode || 200,
            headers: streamRes.headers,
          });
        }).on('error', (err) => reject(err));
      });
    };

    return fetchWithRedirect(downloadUrl);
  }
}
