// backend/routes/auth.js
import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();

/**
 * Set custom claims on user auth token
 * Called when user is created or updated in Firestore
 * 
 * POST /api/auth/set-custom-claims
 * Body: { uid: string, role: string, schoolId: string }
 */
router.post('/set-custom-claims', async (req, res) => {
  try {
    const { uid, role, schoolId } = req.body;

    // Validate inputs
    if (!uid) {
      return res.status(400).json({ error: 'uid is required' });
    }
    if (!role) {
      return res.status(400).json({ error: 'role is required' });
    }

    // Valid roles
    const validRoles = ['Parent', 'Student', 'Teacher', 'Principal'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, {
      role,
      schoolId: schoolId || null
    });

    console.log(`✅ Custom claims set for user ${uid}: role=${role}, schoolId=${schoolId}`);

    res.json({
      success: true,
      message: `Custom claims set for user ${uid}`,
      claims: { role, schoolId }
    });
  } catch (error) {
    console.error('❌ Error setting custom claims:', error);
    
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(500).json({
      error: 'Failed to set custom claims',
      message: error.message
    });
  }
});

export default router;
