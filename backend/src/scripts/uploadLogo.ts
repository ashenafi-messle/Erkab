import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';
import path from 'path';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function run() {
  try {
    const logoPath = path.resolve(__dirname, '../assets/logo/erkab-logo-square.jpg');
    console.log('Uploading logo from:', logoPath);
    const res = await cloudinary.uploader.upload(logoPath, {
      public_id: 'erkab_logo_official',
      folder: 'erkab/branding',
      resource_type: 'image',
      type: 'upload',
      overwrite: true,
    });
    console.log('UPLOADED_LOGO_URL:', res.secure_url);
  } catch (err: any) {
    console.error('Upload failed:', err.message);
  }
}

run();
