import https from 'https';
import { env } from '../config/env';

function testSendViaApi() {
  const payload = JSON.stringify({
    sender: {
      name: 'Erkab Skills Training Organization',
      email: env.BREVO_SENDER_EMAIL,
    },
    to: [
      {
        email: env.BREVO_SENDER_EMAIL,
        name: 'Ashu Rack',
      },
    ],
    subject: 'Erkab Diagnostic Test Email',
    htmlContent: '<p>This is a diagnostic test email from Erkab platform.</p>',
  });

  const options = {
    hostname: 'api.brevo.com',
    port: 443,
    path: '/v3/smtp/email',
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'content-type': 'application/json',
      'accept': 'application/json',
      'content-length': Buffer.byteLength(payload),
    },
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Transactional email API status code:', res.statusCode);
      console.log('Transactional email API response:', data);
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e.message);
  });

  req.write(payload);
  req.end();
}

testSendViaApi();
