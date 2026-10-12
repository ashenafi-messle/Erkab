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
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      return cb(
        new ValidationError(
          `Invalid file format for ${file.originalname}. Only PDF, JPEG, and PNG files are allowed.`
        )
      );
    }

    cb(null, true);
  },
});
