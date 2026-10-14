import nodemailer from 'nodemailer';
import { env } from '../config/env';

async function testCredentials(login: string, pass: string) {
  console.log(`Testing SMTP with login: ${login}`);
  const transporter = nodemailer.createTransport({
    host: env.BREVO_SMTP_SERVER || 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // port 587 STARTTLS
    auth: {
      user: login,
      pass: pass,
    },
    requireTLS: true,
    tls: {
      rejectUnauthorized: true,
    },
  });

  try {
    const res = await transporter.verify();
    console.log(`SUCCESS for login ${login}:`, res);
    return true;
  } catch (err: any) {
    console.log(`FAILED for login ${login}: ${err.message}`);
    return false;
  }
}

async function run() {
  console.log('--- Diagnostic Brevo SMTP Check ---');
  console.log('Server:', env.BREVO_SMTP_SERVER);
  console.log('Port:', env.BREVO_SMTP_PORT);

  // Try current env login
  await testCredentials(env.BREVO_SMTP_LOGIN, env.BREVO_SMTP_KEY);

  // Try sender email as login if different
  if (env.BREVO_SENDER_EMAIL && env.BREVO_SENDER_EMAIL !== env.BREVO_SMTP_LOGIN) {
    await testCredentials(env.BREVO_SENDER_EMAIL, env.BREVO_SMTP_KEY);
  }
}

run();
