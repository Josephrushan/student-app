import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Support both VITE_* and FIREBASE_* prefixed variables
    const firebaseVars = {
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(
        process.env.VITE_FIREBASE_API_KEY || env.VITE_FIREBASE_API_KEY || env.FIREBASE_API_KEY || ''
      ),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(
        process.env.VITE_FIREBASE_AUTH_DOMAIN || env.VITE_FIREBASE_AUTH_DOMAIN || env.FIREBASE_AUTH_DOMAIN || ''
      ),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(
        process.env.VITE_FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID || ''
      ),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(
        process.env.VITE_FIREBASE_STORAGE_BUCKET || env.VITE_FIREBASE_STORAGE_BUCKET || env.FIREBASE_STORAGE_BUCKET || ''
      ),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(
        process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.FIREBASE_MESSAGING_SENDER_ID || ''
      ),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(
        process.env.VITE_FIREBASE_APP_ID || env.VITE_FIREBASE_APP_ID || env.FIREBASE_APP_ID || ''
      ),
      'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify(
        process.env.VITE_FIREBASE_MEASUREMENT_ID || env.VITE_FIREBASE_MEASUREMENT_ID || env.FIREBASE_MEASUREMENT_ID || ''
      ),
    };
    
    return {
      server: {
        port: 3000,
        host: '127.0.0.1',
        middlewareMode: false,
        hmr: {
          host: '127.0.0.1',
          port: 3000
        }
      },
      build: {
        // Exclude api folder from Vite build (Vercel handles it separately)
        rollupOptions: {
          external: ['/api/**']
        }
      },
      define: firebaseVars,
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          buffer: 'buffer',
          process: 'process/browser'
        }
      }
    };
});
