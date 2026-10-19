import multer from 'multer';
import { env } from '../../config/env';
import { ValidationError } from '../errors/AppError';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_BYTES, // 5MB
    files: 5,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      return cb(
        new ValidationError(
          `Invalid file format for ${file.originalname}. Only PDF, JPEG, PNG, and WebP files are allowed.`
        )
      );
    }

    cb(null, true);
  },
});

export const uploadProgramImage = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_BYTES, // 5MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowedImageMimes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
    ];

    if (!allowedImageMimes.includes(file.mimetype)) {
      return cb(
        new ValidationError(
          `Invalid image format for ${file.originalname}. Only JPEG, PNG, and WebP images are allowed.`
        )
      );
    }

    cb(null, true);
  },
});

export const uploadNewsImage = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_BYTES, // 5MB
    files: 10,
  },
  fileFilter: (_req, file, cb) => {
    const allowedImageMimes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
    ];

    if (!allowedImageMimes.includes(file.mimetype)) {
      return cb(
        new ValidationError(
          `Invalid image format for ${file.originalname}. Only JPEG, PNG, and WebP images are allowed.`
        )
      );
    }

    cb(null, true);
  },
});
