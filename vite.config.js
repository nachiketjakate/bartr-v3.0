import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Plugin: remove Apache/cPanel-specific files from dist after build.
// These files (`.htaccess`, `.cpanel.yml`) are only needed for cPanel hosting.
// On Railway (Express), they are irrelevant and .htaccess triggers a 403
// from Express v5's static middleware (dot-file protection).
const removeApacheArtifacts = () => ({
  name: 'remove-apache-artifacts',
  closeBundle() {
    const filesToRemove = ['.htaccess', '.cpanel.yml'];
    filesToRemove.forEach((file) => {
      const filePath = path.resolve('dist', file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[vite] Removed Apache artifact from dist: ${file}`);
      }
    });
  },
});

export default defineConfig({
  plugins: [react(), removeApacheArtifacts()],
  base: '/',
  server: {
    watch: {
      ignored: ['**/server.js', '**/.env'],
    },
  },
});
