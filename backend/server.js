// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import webpush from 'web-push';
import admin from 'firebase-admin';
import pushRoutes from './routes/push.js';
import authRoutes from './routes/auth.js';

dotenv.config();

// Initialize Firebase Admin
const firebaseAdminConfig = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

// Only initialize if we have the necessary credentials
if (firebaseAdminConfig.project_id && firebaseAdminConfig.private_key) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminConfig)
  });
  console.log('✅ Firebase Admin initialized');
} else {
  console.warn('⚠️ Firebase Admin credentials not fully configured. Push notifications may fail.');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Global CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200
}));

// Preflight handler
app.options('*', cors({
  origin: true,
  credentials: true
}));

// Configure web-push with VAPID details
webpush.setVapidDetails(
  'mailto:admin@educater.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Routes
app.use('/api', pushRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running ✅', timestamp: new Date() });
});

// Test CORS endpoint
app.options('/api/test', cors());
app.post('/api/test', (req, res) => {
  res.json({ success: true, message: 'CORS test passed' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║     🎓 Educater Backend Server                   ║
║     Running on http://localhost:${PORT}           ║
║     Environment: ${process.env.NODE_ENV || 'development'}           ║
╚═══════════════════════════════════════════════════╝
  `);
});
