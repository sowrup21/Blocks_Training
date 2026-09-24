import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devHost = env.VITE_BLOCKS_DEV_HOST || 'localhost';
  const devPort = parseInt(env.VITE_BLOCKS_DEV_PORT || '5173', 10);

  const keyPath = path.resolve(import.meta.dirname, '.cert/dev-key.pem');
  const certPath = path.resolve(import.meta.dirname, '.cert/dev-cert.pem');
  const hasCert = fs.existsSync(keyPath) && fs.existsSync(certPath);

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0',
      port: devPort,
      strictPort: true,
      allowedHosts: [devHost, 'localhost', '.slsblx.com'],
      https: hasCert
        ? {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
          }
        : undefined,
    },
  };
});
