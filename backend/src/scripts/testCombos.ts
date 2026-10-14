import nodemailer from 'nodemailer';
import { env } from '../config/env';

async function testCombo(label: string, user: string, pass: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user, pass },
  });

  try {
    await transporter.verify();
    console.log(`[SUCCESS] ${label}: Connected and verified!`);
    return true;
  } catch (err: any) {
    console.log(`[FAILED] ${label}: ${err.message}`);
    return false;
  }
}

async function run() {
  console.log('Testing combinations for smtp-relay.brevo.com:587...');
  // Combo 1: 9999bb001@smtp-brevo.com + SMTP_KEY
  await testCombo('Login 9999bb001 + SMTP_KEY', env.BREVO_SMTP_LOGIN, env.BREVO_SMTP_KEY);

  // Combo 2: 9999bb001@smtp-brevo.com + API_KEY
  await testCombo('Login 9999bb001 + API_KEY', env.BREVO_SMTP_LOGIN, env.BREVO_API_KEY || '');

  // Combo 3: ashurack664@gmail.com + SMTP_KEY
  await testCombo('Login ashurack664 + SMTP_KEY', 'ashurack664@gmail.com', env.BREVO_SMTP_KEY);

  // Combo 4: ashurack664@gmail.com + API_KEY
  await testCombo('Login ashurack664 + API_KEY', 'ashurack664@gmail.com', env.BREVO_API_KEY || '');
}

run();
