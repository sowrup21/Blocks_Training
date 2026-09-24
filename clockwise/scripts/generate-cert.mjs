import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import selfsigned from 'selfsigned';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read dev host from arg, process.env, or .env file
let devHost = process.argv[2] || process.env.VITE_BLOCKS_DEV_HOST;

if (!devHost) {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/^VITE_BLOCKS_DEV_HOST=(.+)$/m);
    if (match) {
      devHost = match[1].trim();
    }
  }
}

if (!devHost) {
  console.error('Error: No domain given. Set VITE_BLOCKS_DEV_HOST in .env or pass as argument: npm run cert -- <domain>');
  process.exit(1);
}

console.log(`Generating self-signed SSL certificate for host: ${devHost}...`);

const attrs = [{ name: 'commonName', value: devHost }];
const pems = await selfsigned.generate(attrs, {
  days: 365,
  keySize: 2048,
  algorithm: 'sha256',
  extensions: [
    {
      name: 'basicConstraints',
      cA: true,
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true,
    },
    {
      name: 'subjectAltName',
      altNames: [
        { type: 2, value: devHost }, // DNS
        { type: 2, value: 'localhost' }, // DNS
        { type: 7, ip: '127.0.0.1' }, // IP
      ],
    },
  ],
});


const certDir = path.join(rootDir, '.cert');
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

const key = pems.private || pems.key;
const cert = pems.cert || pems.certificate;

fs.writeFileSync(path.join(certDir, 'dev-key.pem'), key);
fs.writeFileSync(path.join(certDir, 'dev-cert.pem'), cert);

console.log('Certificate generated successfully in .cert/');
console.log('  - .cert/dev-key.pem');
console.log('  - .cert/dev-cert.pem');
console.log('\nTo trust this certificate on macOS:');
console.log('  sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain .cert/dev-cert.pem\n');
