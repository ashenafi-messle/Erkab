import https from 'https';
import { env } from '../config/env';

function checkBrevoAccount(apiKey: string) {
  const options = {
    hostname: 'api.brevo.com',
    port: 443,
    path: '/v3/account',
    method: 'GET',
    headers: {
      'api-key': apiKey,
      'accept': 'application/json',
    },
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      try {
        const parsed = JSON.parse(data);
        console.log('Account response:', JSON.stringify(parsed, null, 2));
      } catch {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e.message);
  });

  req.end();
}

console.log('Testing Brevo API key...');
checkBrevoAccount(env.BREVO_API_KEY || '');
